import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { BaseModel } from '../../../common/models/base.model';
import type { SocialLink } from '../../../generated/prisma/client';
import { SocialLinkKind } from '../../../generated/prisma/enums';

registerEnumType(SocialLinkKind, {
  name: 'SocialLinkKind',
  description: 'Kind of an external professional resource.',
});

@ObjectType('SocialLink', {
  description: 'Link to GitHub, Telegram or another professional resource.',
})
export class SocialLinkModel
  extends BaseModel
  implements Pick<SocialLink, 'id' | 'kind' | 'label' | 'url'>
{
  @Field(() => SocialLinkKind)
  kind!: SocialLinkKind;

  @Field({ description: 'Human-readable label, e.g. "@timovey73".' })
  label!: string;

  @Field({ description: 'Absolute URL (`mailto:` for e-mail, `tel:` for phone).' })
  url!: string;
}
