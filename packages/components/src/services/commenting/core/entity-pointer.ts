import { BaseCommentPointer, type PointerContext } from './comment-pointer';

// A whole object that takes comments, such as a task, a project or a quote.
export class EntityPointer extends BaseCommentPointer {
  readonly type = 'entity';
  readonly id: string;

  constructor(
    readonly entityType: string,
    readonly entityId: string
  ) {
    super();
    this.id = `${entityType}-${entityId}`;
  }

  serialize(): string {
    return JSON.stringify({
      type: this.type,
      entityType: this.entityType,
      entityId: this.entityId
    });
  }

  async getContext(): Promise<PointerContext> {
    return {
      title: `${this.entityType}: ${this.entityId}`,
      excerpt: `${this.entityType} entity`,
      metadata: {
        entityType: this.entityType,
        entityId: this.entityId
      }
    };
  }

  // Rebuilds a pointer from its serialised key, such as one read back from
  // storage, so its context and its place in a surface can be found again.
  static deserialize(data: string): EntityPointer | null {
    try {
      const parsed = JSON.parse(data);
      if (parsed.type !== 'entity' || !parsed.entityType || !parsed.entityId) {
        return null;
      }
      return new EntityPointer(parsed.entityType, parsed.entityId);
    } catch {
      return null;
    }
  }
}
