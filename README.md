# Client bot service
## Description
This is a user inteface service for getting jobs.
## Architecture
The working of our app can be described by the following scheme:  
____data____data_________________call  
Bot <= DB <= Data fetch service <= Endpoints
### Framework
Curently our app uses the [Telegaf](https://telegraf.js.org/) framework.
The main feature used:  
1. Commands, hears, actions.  
2. [Middleware](https://telegraf.js.org/#/?id=use) ([session](https://telegraf.js.org/#/?id=session) middleware).  
3. Markup ([examples](https://github.com/telegraf/telegraf/tree/develop/docs/examples/)).  
### Main
Handlers attached to commands, hears and actions. We have a handler creators that get three params (views, models, options). 
#### Views
Views messages are configurable and can be setting with various localizations(It can be configured in json message file).
#### Models
This is a wrapper over a monguse scheme.
#### Contollers
This is a handler of telegram bot commands, actions, hears, ...
This handlers are callbacks which can be configured by higher order function.
