# KeystoneJS Blank Starter Template

You've created a KeystoneJS project! This project contains an AdminUI and GraphQL App.

You probably want to add Lists, Authentication, Access control and a front-end application.

## Running the Project.

To run this project first run `npm install`. Note: If you generated this project via the Keystone cli step this has been done for you \\o/.

Once running the Keystone Admin UI is reachable via: `localhost:3000/admin`.

## Next steps

This example has no front-end application but you can build your own using the GraphQL API (`http://localhost:3000/admin/graphiql`).

## Setting up battles schema stuff

Battle

- battle intro description
- mission
- armyInfo1
- armyInfo2
- battle summary
- photos

ArmyBattleInfo

- army link
- battle primary score
- secondary 1
- secondary 2
- secondary 3
- secondary 1 score
- secondary 2 score
- secondary 3 score

Army

- player
- faction
- name
- description
- (units)
- (points values)

## What works, what's in progress, what would be nice

- need to work on adding images to battles for batrep stuff
- all the css and UI improvements - have a bit of a poke on mobile
- no real plans to link units and models to armies right now - would be neat to be able to link a battlescribe file or something though

## Next pages:

- Add a home page with a small amount of info around it all ✅
  - capture permissions errors and bounce people to the home page (currently these are so badly handled)
- ~~Add a page for a user~~
  - ~~See details of armies, create and delete armies~~
    this is sort of done by the admin UI - let's not double up quite yet
- Solidify how pages load, have proper loading states, not jumpy loading
- Handle errors better - consistently handle 'logged out' errors and views for pages
- Add battle 'locations' ala Mark's fun idea, so there's more inbuilt personality
- add ability to add photos so battle narrative can be written out during play
- add stratagems in, omg this would help me so much, plus phase-based army notations
