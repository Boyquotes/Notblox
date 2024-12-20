import Rapier from '../../../physics/rapier.js'
import { ComponentAddedEvent } from '../../../../../shared/component/events/ComponentAddedEvent.js'
import { EventSystem } from '../../../../../shared/system/EventSystem.js'
import { KinematicRigidBodyComponent } from '../../component/physics/KinematicRigidBodyComponent.js'
import { ComponentRemovedEvent } from '../../../../../shared/component/events/ComponentRemovedEvent.js'
import { PositionComponent } from '../../../../../shared/component/PositionComponent.js'
import { Entity } from '../../../../../shared/entity/Entity.js'
import { EntityManager } from '../../../../../shared/system/EntityManager.js'

export class KinematicRigidBodySystem {
  update(entities: Entity[], world: Rapier.World) {
    const createEvents = EventSystem.getEventsWrapped(
      ComponentAddedEvent,
      KinematicRigidBodyComponent
    )
    for (const event of createEvents) {
      const entity = EntityManager.getEntityById(entities, event.entityId)
      if (!entity) {
        console.error('DynamicRigidBodySystem: Entity not found')
        continue
      }
      this.onComponentAdded(entity, event, world)
    }

    const removedEvents = EventSystem.getEventsWrapped(
      ComponentRemovedEvent,
      KinematicRigidBodyComponent
    )

    for (const event of removedEvents) {
      this.onComonentRemoved(event, world)
    }
  }
  onComponentAdded(
    entity: Entity,
    event: ComponentAddedEvent<KinematicRigidBodyComponent>,
    world: Rapier.World
  ) {
    // No position component here, we move the body directly, so it's at the origin
    const physicsBodyComponent = event.component
    const kinematic = Rapier.RigidBodyDesc.kinematicPositionBased()
    kinematic.setCcdEnabled(true)

    const rigidBody = world.createRigidBody(kinematic)
    physicsBodyComponent.body = rigidBody

    const positionComponent = entity.getComponent(PositionComponent)
    if (positionComponent) {
      rigidBody.setTranslation(
        new Rapier.Vector3(positionComponent.x, positionComponent.y, positionComponent.z),
        false
      )
    }
  }

  onComonentRemoved(
    event: ComponentRemovedEvent<KinematicRigidBodyComponent>,
    world: Rapier.World
  ) {
    const physicsBodyComponent = event.component
    if (physicsBodyComponent.body) world.removeRigidBody(physicsBodyComponent.body)
  }
}
