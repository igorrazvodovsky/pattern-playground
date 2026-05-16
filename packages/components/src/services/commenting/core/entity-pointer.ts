import { BaseCommentPointer, type PointerContext } from './comment-pointer';

export class EntityPointer extends BaseCommentPointer {
  readonly type = 'entity';
  readonly id: string;
  
  constructor(
    private entityType: string,
    private entityId: string
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
  
  equals(other: CommentPointer): boolean {
    if (other.type !== this.type) return false;
    const otherEntity = other as EntityPointer;
    return otherEntity.entityType === this.entityType && 
           otherEntity.entityId === this.entityId;
  }
  
  async getContext(): Promise<PointerContext> {
    // In production, would fetch entity details from appropriate service
    // For now, returning a generic context
    return {
      title: `${this.entityType}: ${this.entityId}`,
      excerpt: `${this.entityType} entity`,
      metadata: { 
        entityType: this.entityType,
        entityId: this.entityId
      }
    };
  }
  
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
  
  getEntityType(): string {
    return this.entityType;
  }
  
  getEntityId(): string {
    return this.entityId;
  }
}