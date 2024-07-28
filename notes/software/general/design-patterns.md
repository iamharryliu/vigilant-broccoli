# Design Patterns

- Creational Patterns - patterns based on how obhects are created
- Structural Patterns - patterns based on how objects relate to each other
- Behavioral Patterns - patterns based on how object communicate with each other

## Creational

How objects are created.

- Singleton - single instantiated object such as settings which can only be instantiated once
- Prototype - clone, alternative of inheritance, flat prototype chain
- Builder - build things step by step using helper functions, can chain functions to and get back the same object (ie thing = obj.addsomething().addsomething()..., addSomething() returns this)
- Factory - let create functions to handle creation logic of objects

## Structural

How objects relate to each other.

- Facade - hides low level details using high level functions
- Proxy - substitute for target object

## Behavioral

How objects communicate with each other.

- Iterator - pull based system, traverse collection of objects
- Observer - push based system, one to many relationship where many objects subscribe to events from another object
- Mediator - middleman/broker class that helps with communication
- State - solves issue of handling state using large switch statements that check state by passing in objects tha (class with function that checks multiple conditions vs class that takes in value with the appropriate values), less API change

## Referances

[10 Design Patterns Explained in 10 Minutes](https://www.youtube.com/watch?v=tv-_1er1mWI&t=139s)
