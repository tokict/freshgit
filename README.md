Freshgit
=================

A Node cli tool for importing user's Github account into Freshdesk contacts


## `Usage`

```
  $ git clone git@github.com:tokict/freshgit.git
  $ cd freshgit
  $ npm install
  $ cp .env.dist .env 
  !Fill in info in the env file!
  
  $ npm run start [domain] [username] OR npm run dev

ARGS
  domain,      Freshdesk domain (optional)
  username,    Github username (optional)

DESCRIPTION
  If args are not provided, the app will demand them once started
```
