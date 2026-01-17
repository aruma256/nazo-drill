/**
 * ハッシュ関連のユーティリティ関数
 */

/**
 * 文字列をSHA-256でハッシュ化する
 * @param text ハッシュ化する文字列
 * @returns ハッシュ値（16進数文字列）
 */
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}
