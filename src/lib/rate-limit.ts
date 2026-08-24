export class RateLimitError extends Error {
  status = 429

  constructor(
    public override message: string = 'Забагато запитів. Спробуйте пізніше.',
  ) {
    super(message)
  }

  toResponse() {
    return Response.json(
      {
        error: this.message,
        code: this.status,
      },
      {
        status: 429,
      },
    )
  }
}
