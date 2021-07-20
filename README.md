# Tradovate AutoTrade
AutoTrade is a simple starting point for building an automated trading system using the Tradovate API. It is merely an example of how you _could_ perform automated trading, and not by any means trading strategy advice - DYOR. This software is primarily for educational purposes, but it lays the foundation for creating your own automated trading system. Feel free to clone or fork this repo for your own purposes.

## Motivation
The Tradovate API offers powerful futures trading functionality. I wanted to showcase some uses for the API, and I especially wanted to show off how we can use tools like brackets strategies to minimize losses. One way we could utilize the API and brackets strategies is by creating a trading robot. AutoTrade employs a variation of the crossover-strategy, which relies on tracking the difference between two or more moving averages of varying periods. The interactions between these moving averages can give the robot a Buy or Sell signal.

## Run the AutoTrade Example
Clone this repository. Then open a terminal and navigate to the containing folder. First install dependencies:
```
yarn install
```
Next, open `index.js`. Near the top of the file are the environment variables. Set `USER` to your username, and `PASS` to your password.

Then you can run the robot:
```
yarn start
```

You'll be prompted to choose an account, then you'll need to pick a contract to watch and setup some parameters. Once you have everything ready, the robot will begin monitoring the tick stream based on your configuration.