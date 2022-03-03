# API for the eindopdracht for android

## installation guide

- run npm install
- run Node index.js
- enjoy the fun

## ports

- ### /
    this will simply open a main/welcome page in the browser

- ### /claims
    A post url where you can add a new Claim
    parameters:
    +-----------+----------+
    | code      | required |
    | claimType |          |
    | date      |          |
    | location  |          |
    +-----------+----------+

- ### /claims/:code
    Get the claim bound to the given code

    
- ### /claims/:id
    Update or delete the given claim (found by id). When updating, also give in the body the parameters that need to change (see /claims)