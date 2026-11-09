import { avatarObjectKey } from './avatar';

describe('avatarObjectKey', () => {
  const photo = new TextEncoder().encode('jpeg bytes');

  it('addresses the avatar by content under the public prefix', () => {
    expect(avatarObjectKey(photo, 'avatar.JPG')).toMatch(/^public\/avatars\/[0-9a-f]{16}\.jpg$/);
  });

  it('is stable for the same content and changes with it', () => {
    expect(avatarObjectKey(photo, 'a.jpg')).toBe(avatarObjectKey(photo, 'b.jpg'));
    expect(avatarObjectKey(new TextEncoder().encode('other'), 'a.jpg')).not.toBe(
      avatarObjectKey(photo, 'a.jpg'),
    );
  });
});
