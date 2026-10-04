import { constants, createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { get } from 'node:https'
import { pathToFileURL } from 'node:url'
import { unzipSync } from 'fflate'
import { read } from 'shapefile'
import { merge } from 'topojson-client'
import { topology } from 'topojson-server'
import polygonClipping from 'polygon-clipping'
import { PREFECTURES } from '../src/constants/prefectures.ts'
import { PREFECTURE_MAP_COLORS } from '../src/constants/theme.ts'

// Source: GSI Global Map Japan v2.1 administrative boundaries (2015-01-01).
// Lakes: GSI Global Map Japan v2 hydrology.
// https://www.gsi.go.jp/kankyochiri/gm_jpn.html
// Attribution and processing notices: drill start screen and generated SVG.
// Local archives: npm run generate:prefecture-shapes -- boundaries.zip hydrology.zip
const SOURCE_ARCHIVE = 'gm-jpn-bnd_u_2_1'
const SOURCE_SHA256 =
  '826a2b54630f2d15376bc1831aafe77f72f107e1c39ef0034bb41b184330faaa'
const WATER_ARCHIVE = 'gm-jpn-hydro_u_2'
const WATER_SHA256 =
  '82ef18af0ab0abc3be7ccc7c29e53d061af49ecc4697e965a4657bb528a5d4f0'
// Values of the official Shapefile's `nam` field, in prefecture-code order.
export const SOURCE_PREFECTURE_NAMES = [
  'Hokkai Do',
  'Aomori Ken',
  'Iwate Ken',
  'Miyagi Ken',
  'Akita Ken',
  'Yamagata Ken',
  'Fukushima Ken',
  'Ibaraki Ken',
  'Tochigi Ken',
  'Gunma Ken',
  'Saitama Ken',
  'Chiba Ken',
  'Tokyo To',
  'Kanagawa Ken',
  'Niigata Ken',
  'Toyama Ken',
  'Ishikawa Ken',
  'Fukui Ken',
  'Yamanashi Ken',
  'Nagano Ken',
  'Gifu Ken',
  'Shizuoka Ken',
  'Aichi Ken',
  'Mie Ken',
  'Shiga Ken',
  'Kyoto Fu',
  'Osaka Fu',
  'Hyogo Ken',
  'Nara Ken',
  'Wakayama Ken',
  'Tottori Ken',
  'Shimane Ken',
  'Okayama Ken',
  'Hiroshima Ken',
  'Yamaguchi Ken',
  'Tokushima Ken',
  'Kagawa Ken',
  'Ehime Ken',
  'Kochi Ken',
  'Fukuoka Ken',
  'Saga Ken',
  'Nagasaki Ken',
  'Kumamoto Ken',
  'Oita Ken',
  'Miyazaki Ken',
  'Kagoshima Ken',
  'Okinawa Ken',
]
const SIZE = 320
const PADDING = 16
const TOLERANCE = 0.35
// Same visibility rule for every prefecture, measured in the 320px SVG:
// at least 12 square pixels and 3px on each axis after clipping to the land.
// This keeps recognisable lakes even when a large prefecture is scaled down.
const MIN_LAKE_AREA = 12
const MIN_LAKE_SPAN = 3

export function verifySourceArchive(archive, expected = SOURCE_SHA256) {
  const actual = createHash('sha256').update(archive).digest('hex')
  if (actual !== expected) {
    throw new Error(
      `Source SHA-256 mismatch: expected ${expected}, received ${actual}`,
    )
  }
}

async function downloadSourceArchive(name) {
  const url = `https://www1.gsi.go.jp/geowww/globalmap-gsi/download/data/gm-japan/${name}.zip`
  return new Promise((resolve, reject) => {
    const request = get(
      url,
      {
        // This GSI host needs legacy TLS renegotiation support. Certificate
        // verification remains enabled, and the archive is also hash-checked.
        secureOptions: constants.SSL_OP_LEGACY_SERVER_CONNECT,
      },
      (response) => {
        if (response.statusCode !== 200) {
          response.resume()
          reject(new Error(`Download failed: HTTP ${response.statusCode}`))
          return
        }
        const chunks = []
        response.on('data', (chunk) => chunks.push(chunk))
        response.on('end', () => resolve(Buffer.concat(chunks)))
        response.on('error', reject)
      },
    )
    request.on('error', reject)
    request.setTimeout(60_000, () =>
      request.destroy(new Error('Source download timed out')),
    )
  })
}

export function createPrefectureFeatures(source) {
  // Use the prefecture name, not adm_code: some island records use UNK, and
  // one Akita Ken record in this edition has an inconsistent code (06024).
  const codesByName = new Map(
    SOURCE_PREFECTURE_NAMES.map((name, index) => [name, index + 1]),
  )
  for (const { geometry } of source.features) {
    if (!['Polygon', 'MultiPolygon'].includes(geometry?.type)) {
      throw new Error(`Unsupported municipality geometry: ${geometry?.type}`)
    }
  }

  // Shared arcs let merge remove municipal borders while preserving outer
  // rings, islands and holes. Do not simplify or round before this union.
  const municipalities = topology({ municipalities: source })
  const groups = new Map()
  for (const geometry of municipalities.objects.municipalities.geometries) {
    const id = codesByName.get(geometry.properties.nam)
    if (!id) {
      throw new Error(`Unknown prefecture: ${geometry.properties.nam}`)
    }
    if (!groups.has(id)) groups.set(id, [])
    groups.get(id).push(geometry)
  }
  if (groups.size !== PREFECTURES.length) {
    throw new Error(
      'Expected all 47 prefectures in the administrative boundaries',
    )
  }
  return PREFECTURES.map(({ id, name }) => ({
    type: 'Feature',
    properties: { id, nam_ja: name },
    geometry: merge(municipalities, groups.get(id)),
  }))
}

async function readSourceArchive(archive, name, layer, sha256) {
  verifySourceArchive(archive, sha256)
  const stem = `${name}/${layer}`
  const files = unzipSync(archive, {
    filter: ({ name }) => name === `${stem}.shp` || name === `${stem}.dbf`,
  })
  if (!files[`${stem}.shp`] || !files[`${stem}.dbf`]) {
    throw new Error(`Missing ${layer} Shapefile or attributes`)
  }
  // The pinned source uses ITRF 1994 longitude/latitude in degrees, and the
  // prefecture names/codes used here are ASCII. No CRS conversion is needed.
  return read(files[`${stem}.shp`], files[`${stem}.dbf`])
}

export function selectLakeGeometries(source) {
  // Global Map HYT: 4 = lake/pond, 10 = reservoir. River polygons are excluded.
  return source.features
    .filter(({ properties }) => [4, 10].includes(properties.hyt))
    .map(({ geometry }) => geometry)
}

function project([longitude, latitude]) {
  const radians = (latitude * Math.PI) / 180
  return [
    longitude * (Math.PI / 180),
    -Math.log(Math.tan(Math.PI / 4 + radians / 2)),
  ]
}

function bounds(points) {
  return points.reduce(
    (box, [x, y]) => [
      Math.min(box[0], x),
      Math.min(box[1], y),
      Math.max(box[2], x),
      Math.max(box[3], y),
    ],
    [Infinity, Infinity, -Infinity, -Infinity],
  )
}

function area(ring) {
  let sum = 0
  for (let i = 1; i < ring.length; i++) {
    sum += ring[i - 1][0] * ring[i][1] - ring[i][0] * ring[i - 1][1]
  }
  return Math.abs(sum / 2)
}

function distanceSquared(point, start, end) {
  const dx = end[0] - start[0]
  const dy = end[1] - start[1]
  const t =
    dx === 0 && dy === 0
      ? 0
      : Math.max(
          0,
          Math.min(
            1,
            ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) /
              (dx * dx + dy * dy),
          ),
        )
  return (
    (point[0] - start[0] - t * dx) ** 2 + (point[1] - start[1] - t * dy) ** 2
  )
}

// Iterative Douglas–Peucker avoids recursion limits on detailed coastlines.
function simplify(ring) {
  const keep = new Set([0, ring.length - 1])
  const pending = [[0, ring.length - 1]]
  while (pending.length > 0) {
    const [start, end] = pending.pop()
    let farthest = -1
    let maximum = TOLERANCE ** 2
    for (let i = start + 1; i < end; i++) {
      const distance = distanceSquared(ring[i], ring[start], ring[end])
      if (distance > maximum) {
        maximum = distance
        farthest = i
      }
    }
    if (farthest !== -1) {
      keep.add(farthest)
      pending.push([start, farthest], [farthest, end])
    }
  }
  const result = ring.filter((_, index) => keep.has(index))
  return result.length >= 4 ? result : ring
}

export function createShape(geometry) {
  return createMap(geometry).path
}

function projectPolygons(geometry) {
  if (!['Polygon', 'MultiPolygon'].includes(geometry.type)) {
    throw new Error(`Unsupported geometry: ${geometry.type}`)
  }
  const coordinates =
    geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
  return coordinates.map((polygon) => polygon.map((ring) => ring.map(project)))
}

export function createMap(geometry, lakes = []) {
  const polygons = projectPolygons(geometry)
  const main = polygons.reduce((largest, polygon) =>
    area(polygon[0]) > area(largest[0]) ? polygon : largest,
  )
  const mainBounds = bounds(main[0])
  const margin =
    Math.max(mainBounds[2] - mainBounds[0], mainBounds[3] - mainBounds[1]) * 0.2
  const mainArea = area(main[0])
  // Keep the main landmass and nearby islands. Exclude distant islands so Tokyo
  // and Okinawa remain recognisable on a phone; keep every ring (including holes).
  const visible = polygons.filter((polygon) => {
    const box = bounds(polygon[0])
    return (
      area(polygon[0]) >= mainArea * 0.0001 &&
      box[0] >= mainBounds[0] - margin &&
      box[1] >= mainBounds[1] - margin &&
      box[2] <= mainBounds[2] + margin &&
      box[3] <= mainBounds[3] + margin
    )
  })
  const box = bounds(visible.flatMap((polygon) => polygon[0]))
  const width = box[2] - box[0]
  const height = box[3] - box[1]
  const scale = (SIZE - PADDING * 2) / Math.max(width, height)
  const offsetX = (SIZE - width * scale) / 2
  const offsetY = (SIZE - height * scale) / 2
  const toPath = (parts) =>
    parts
      .flatMap((polygon) =>
        polygon.map((ring) => {
          const points = simplify(
            ring.map(([x, y]) => [
              (x - box[0]) * scale + offsetX,
              (y - box[1]) * scale + offsetY,
            ]),
          )
          return (
            points
              .slice(0, -1)
              .map(
                ([x, y], index) =>
                  `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`,
              )
              .join('') + 'Z'
          )
        }),
      )
      .join('')

  const visibleLakes = []
  for (const lake of lakes) {
    for (const polygon of projectPolygons(lake)) {
      const lakeBox = bounds(polygon[0])
      if (
        lakeBox[2] < box[0] ||
        lakeBox[0] > box[2] ||
        lakeBox[3] < box[1] ||
        lakeBox[1] > box[3]
      )
        continue
      // Clip before measuring visibility. This also preserves islands in lakes
      // and splits lakes crossing prefectural borders into their local portions.
      const clipped = polygonClipping.intersection(visible, [polygon])
      for (const part of clipped) {
        const partBox = bounds(part[0])
        const lakeArea =
          area(part[0]) -
          part.slice(1).reduce((sum, ring) => sum + area(ring), 0)
        if (
          lakeArea * scale ** 2 >= MIN_LAKE_AREA &&
          (partBox[2] - partBox[0]) * scale >= MIN_LAKE_SPAN &&
          (partBox[3] - partBox[1]) * scale >= MIN_LAKE_SPAN
        ) {
          visibleLakes.push(part)
        }
      }
    }
  }
  return { path: toPath(visible), lakePath: toPath(visibleLakes) }
}

async function generate() {
  const [sourceFile, waterFile] = process.argv.slice(2)
  const [archive, waterArchive] = await Promise.all([
    sourceFile ? readFile(sourceFile) : downloadSourceArchive(SOURCE_ARCHIVE),
    waterFile ? readFile(waterFile) : downloadSourceArchive(WATER_ARCHIVE),
  ])
  const [boundaries, water] = await Promise.all([
    readSourceArchive(archive, SOURCE_ARCHIVE, 'polbnda_jpn', SOURCE_SHA256),
    readSourceArchive(
      waterArchive,
      WATER_ARCHIVE,
      'inwatera_jpn',
      WATER_SHA256,
    ),
  ])
  const features = createPrefectureFeatures(boundaries)
  const lakes = selectLakeGeometries(water)
  const shapes = Object.fromEntries(
    features.map((feature) => [
      feature.properties.id,
      {
        name: feature.properties.nam_ja,
        ...createMap(feature.geometry, lakes),
      },
    ]),
  )
  const target = new URL(
    '../src/drills/prefectureShape/shapes.json',
    import.meta.url,
  )
  await writeFile(target, JSON.stringify(shapes, null, 2) + '\n')
  await writeFile(
    new URL('../public/prefecture-shape-example.svg', import.meta.url),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><metadata>出典：国土地理院「地球地図日本」行政界第2.1版・水系第2版（https://www.gsi.go.jp/kankyochiri/gm_jpn.html）を加工して作成</metadata><defs><clipPath id="land"><path d="${shapes[1].path}" clip-rule="evenodd"/></clipPath></defs><path d="${shapes[1].path}" fill="${PREFECTURE_MAP_COLORS.land}" fill-rule="evenodd"/><path d="${shapes[1].lakePath}" fill="${PREFECTURE_MAP_COLORS.lake}" stroke="${PREFECTURE_MAP_COLORS.border}" stroke-width="0.7" fill-rule="evenodd" clip-path="url(#land)"/><path d="${shapes[1].path}" fill="none" stroke="${PREFECTURE_MAP_COLORS.border}" stroke-width="1.5" stroke-linejoin="round"/></svg>\n`,
  )
  console.log(
    `Generated 47 maps (${JSON.stringify(shapes).length.toLocaleString()} bytes, ${Object.values(shapes).filter(({ lakePath }) => lakePath).length} with lakes) from GSI ${SOURCE_ARCHIVE} and ${WATER_ARCHIVE}`,
  )
}

// Importable for geometry tests without downloading or rewriting assets.
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await generate()
}
