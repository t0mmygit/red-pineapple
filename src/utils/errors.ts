export class UserNotFoundError extends Error {
  constructor(public userId: string) {
    super(`User with ID ${userId} not found.`);
    this.name = 'UserNotFoundError';
  }
}
