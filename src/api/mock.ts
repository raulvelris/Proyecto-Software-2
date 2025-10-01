export type MockResponse<T> = Promise<{ data: T }>

export function mockDelay(ms = 600) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function mockOk<T>(data: T, ms = 600): MockResponse<T> {
  await mockDelay(ms)
  return { data }
}

export async function mockFail<T = never>(message: string, ms = 600): Promise<never> {
  await mockDelay(ms)
  throw new Error(message)
}
