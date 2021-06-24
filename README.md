# Tradobot
> Still a WIP.

Tradobot is a simple starting point for building an automated trading system using the Tradovate API. It is merely an example of how you _could_ perform automated trading, and not by any means trading strategy advice - DYOR. This software is primarily for educational purposes, but it lays the foundation for creating your own automated trading system. Feel free to clone or fork this repo for your own purposes.

## Motivation
The Tradovate API offers powerful futures trading functionality. One way we could utilize this functionality is by creating a trading robot. Tradobot employs a crossover-strategy, which relies on tracking the difference between two moving averages of a long and short period. The interactions between these moving averages can give the robot a Buy or Sell signal.

## Run the Tradobot Example
Clone this repository. Then open a terminal and navigate to the containing folder. First install dependencies:
```
yarn install
```
Next, open `index.js`. Near the top of the file are the environment variables. Set `USER` to your username, and `PASS` to your password.

Then you can run the robot:
```
yarn start
```

You'll be prompted to choose an account, then you'll need to pick a contract to monitor and setup some parameters. Once you have everything ready, the robot will begin monitoring the tick stream based on your configuration.