import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import {
  createPrefectureFeatures,
  createMap,
  createShape,
  selectLakeGeometries,
  SOURCE_PREFECTURE_NAMES,
  verifySourceArchive,
} from './generate-prefecture-shapes.mjs'
import { PREFECTURES } from '../src/constants/prefectures.ts'

const rectangle = (left, bottom, right, top) => [
  [left, bottom],
  [right, bottom],
  [right, top],
  [left, top],
  [left, bottom],
]

test('projects north upward and fits the outline without stretching', () => {
  const path = createShape({
    type: 'Polygon',
    coordinates: [rectangle(139, 35, 140, 36)],
  })
  const coordinates = [...path.matchAll(/[ML]([\d.]+),([\d.]+)/g)].map(
    ([, x, y]) => [Number(x), Number(y)],
  )
  const [[left, bottom], [right], [, top]] = coordinates
  assert.ok(top < bottom)
  assert.equal(top, 16)
  assert.equal(bottom, 304)
  assert.ok(right - left < bottom - top) // Longitude degrees are shorter here.
  assert.ok(Math.abs(left + right - 320) < 0.1)
})

test('preserves polygon holes as separate closed subpaths', () => {
  const path = createShape({
    type: 'Polygon',
    coordinates: [
      rectangle(139, 35, 140, 36),
      rectangle(139.2, 35.2, 139.4, 35.4),
    ],
  })
  assert.equal((path.match(/M/g) ?? []).length, 2)
  assert.equal((path.match(/Z/g) ?? []).length, 2)
})

test('keeps nearby islands but excludes distant and tiny islands', () => {
  const main = rectangle(139, 35, 140, 36)
  const nearby = rectangle(140.05, 35.5, 140.1, 35.6)
  const distant = rectangle(142, 25, 142.5, 25.5)
  const tiny = rectangle(139.1, 35.1, 139.10001, 35.10001)
  const path = createShape({
    type: 'MultiPolygon',
    coordinates: [[distant], [nearby], [main], [tiny]],
  })
  assert.equal((path.match(/M/g) ?? []).length, 2)
  const xs = [...path.matchAll(/[ML]([\d.]+),/g)].map(([, x]) => Number(x))
  const ys = [...path.matchAll(/[ML][\d.]+,([\d.]+)/g)].map(([, y]) =>
    Number(y),
  )
  assert.ok(xs.every((x) => x >= 16 && x <= 304))
  assert.ok(ys.every((y) => y >= 16 && y <= 304))
})

test('rejects non-polygon geometry', () => {
  assert.throws(
    () => createShape({ type: 'Point', coordinates: [139, 35] }),
    /Unsupported geometry/,
  )
})

function municipality(id, rings = [rectangle(139, 35, 140, 36)], code) {
  return {
    type: 'Feature',
    properties: {
      nam: SOURCE_PREFECTURE_NAMES[id - 1] ?? 'Unknown Prefecture',
      adm_code: code ?? `${String(id).padStart(2, '0')}001`,
    },
    geometry: { type: 'Polygon', coordinates: rings },
  }
}

function administrativeBoundaries(
  features = PREFECTURES.map(({ id }) => municipality(id)),
) {
  return { type: 'FeatureCollection', features }
}

test('merges municipal borders and keeps islands with unknown municipal codes', () => {
  const source = administrativeBoundaries([
    // Missing administrative codes do not prevent assignment to a prefecture.
    municipality(1, [rectangle(142, 35, 142.1, 35.1)], 'UNK'),
    municipality(1, [rectangle(139, 35, 140, 36)]),
    municipality(1, [rectangle(140, 35, 141, 36)], '01002'),
    ...PREFECTURES.slice(1).map(({ id }) => municipality(id)),
  ])
  const features = createPrefectureFeatures(source)
  assert.deepEqual(
    features.map(({ properties }) => properties),
    PREFECTURES.map(({ id, name }) => ({ id, nam_ja: name })),
  )
  const { coordinates } = features[0].geometry
  assert.equal(coordinates.length, 2) // One merged mainland and one island.
  assert.equal(coordinates[0].length, 1)
  const main = coordinates.find(([ring]) => ring.some(([x]) => x === 139))
  assert.ok(main)
  const ring = main[0]
  assert.deepEqual(ring[0], ring.at(-1))
  assert.ok(ring.some(([x]) => x === 141))
  for (let i = 1; i < ring.length; i++) {
    assert.ok(!(ring[i - 1][0] === 140 && ring[i][0] === 140))
  }
  assert.deepEqual(
    createPrefectureFeatures(
      administrativeBoundaries([...source.features].reverse()),
    ).map(({ properties }) => properties),
    features.map(({ properties }) => properties),
  )
})

test('preserves holes when merging administrative boundaries', () => {
  const source = administrativeBoundaries()
  source.features[0] = municipality(1, [
    rectangle(139, 35, 140, 36),
    rectangle(139.2, 35.2, 139.4, 35.4).reverse(),
  ])
  const [feature] = createPrefectureFeatures(source)
  assert.equal(feature.geometry.coordinates.length, 1)
  assert.equal(feature.geometry.coordinates[0].length, 2)
  assert.equal((createShape(feature.geometry).match(/M/g) ?? []).length, 2)
})

test('rejects missing prefectures and unknown prefecture names', () => {
  assert.throws(
    () =>
      createPrefectureFeatures(
        administrativeBoundaries(
          PREFECTURES.slice(1).map(({ id }) => municipality(id)),
        ),
      ),
    /Expected all 47 prefectures/,
  )
  const source = administrativeBoundaries()
  source.features.push(municipality(48, undefined, 'UNK'))
  assert.throws(() => createPrefectureFeatures(source), /Unknown prefecture/)
})

test('uses the prefecture name despite an inconsistent administrative code', () => {
  const source = administrativeBoundaries()
  source.features[4].properties.adm_code = '06024' // Official v2.1 source quirk.
  const features = createPrefectureFeatures(source)
  assert.deepEqual(features[4].properties, { id: 5, nam_ja: '秋田県' })
  assert.deepEqual(features[5].properties, { id: 6, nam_ja: '山形県' })
})

test('rejects non-polygon administrative boundaries', () => {
  const source = administrativeBoundaries()
  source.features[0].geometry = { type: 'Point', coordinates: [139, 35] }
  assert.throws(
    () => createPrefectureFeatures(source),
    /Unsupported municipality geometry/,
  )
})

test('rejects altered source data before parsing or rewriting assets', () => {
  assert.throws(
    () => verifySourceArchive(Buffer.from('not the official archive')),
    /Source SHA-256 mismatch/,
  )
})

function pathBounds(path) {
  const coordinates = [...path.matchAll(/[ML]([\d.]+),([\d.]+)/g)].map(
    ([, x, y]) => [Number(x), Number(y)],
  )
  return [
    Math.min(...coordinates.map(([x]) => x)),
    Math.min(...coordinates.map(([, y]) => y)),
    Math.max(...coordinates.map(([x]) => x)),
    Math.max(...coordinates.map(([, y]) => y)),
  ]
}

const polygon = (...rings) => ({ type: 'Polygon', coordinates: rings })

test('projects land and lakes together without changing the land viewport', () => {
  const land = polygon(rectangle(139, 35, 140, 36))
  const lake = polygon(rectangle(139.25, 35.25, 139.75, 35.75))
  const map = createMap(land, [lake])
  assert.equal(map.path, createShape(land))
  const box = pathBounds(map.path)
  const lakeBox = pathBounds(map.lakePath)
  assert.ok(lakeBox[0] > box[0] && lakeBox[2] < box[2])
  assert.ok(lakeBox[1] > box[1] && lakeBox[3] < box[3])
  assert.ok(
    Math.abs((lakeBox[2] - lakeBox[0]) / (box[2] - box[0]) - 0.5) < 0.001,
  )
})

test('clips a lake crossing prefectural borders to each prefecture', () => {
  const lake = polygon(rectangle(139.7, 35.3, 140.3, 35.7))
  const left = createMap(polygon(rectangle(139, 35, 140, 36)), [lake])
  const right = createMap(polygon(rectangle(140, 35, 141, 36)), [lake])
  assert.ok(left.lakePath && right.lakePath)
  assert.equal(pathBounds(left.lakePath)[2], pathBounds(left.path)[2])
  assert.equal(pathBounds(right.lakePath)[0], pathBounds(right.path)[0])
  assert.ok(pathBounds(left.lakePath)[0] > pathBounds(left.path)[0])
  assert.ok(pathBounds(right.lakePath)[2] < pathBounds(right.path)[2])
})

test('keeps islands inside a lake as unfilled interior rings', () => {
  const land = polygon(rectangle(139, 35, 140, 36))
  const lake = polygon(
    rectangle(139.1, 35.1, 139.9, 35.9),
    rectangle(139.4, 35.4, 139.6, 35.6),
  )
  const { lakePath } = createMap(land, [lake])
  assert.equal((lakePath.match(/M/g) ?? []).length, 2)
  assert.equal((lakePath.match(/Z/g) ?? []).length, 2)
})

test('omits tiny lakes, clipped slivers and lakes outside the visible land', () => {
  const land = {
    type: 'MultiPolygon',
    coordinates: [
      [rectangle(139, 35, 140, 36)],
      [rectangle(145, 25, 145.5, 25.5)],
    ],
  }
  const lakes = [
    polygon(rectangle(139.2, 35.2, 139.201, 35.201)),
    polygon(rectangle(138, 35.1, 139.001, 35.9)),
    polygon(rectangle(139.1, 35.1, 139.8, 35.101)),
    polygon(rectangle(145.1, 25.1, 145.4, 25.4)),
  ]
  assert.equal(createMap(land, lakes).lakePath, '')
})

test('includes lakes and reservoirs while excluding rivers and marshes', () => {
  const features = [4, 10, 1, 13].map((hyt, index) => ({
    properties: { hyt },
    geometry: polygon(rectangle(139 + index, 35, 140 + index, 36)),
  }))
  assert.deepEqual(selectLakeGeometries({ features }), [
    features[0].geometry,
    features[1].geometry,
  ])
})
