import React, { Component } from 'react';
import { DIRECTIONS } from '../util/Constant';
import '../css/style.css';

export default class Rover extends Component{
   // setting an initial state
   state = {
       x: 0,
       y: 0,
       facing: 0,
       sizeX: 0,
       sizeY: 0,
       outputMessage: '',
   };

    // gets the value from user inputs (textarea) and set them in the state
    changeHandler = (e) => {
        const nextState = {};
        nextState[e.target.name] = e.target.value;
        this.setState(nextState);
    }

    //execute the whole batch of instructions from user input
    executeRover = () => {
        const {inputValue} = this.state;
        const inputLines = (inputValue && inputValue.split('\n')) || '';
        if (inputLines.length > 0) {
            //get size for plateau from first line of input
            const coordinates = this.getCoordinates(inputLines[0]);
            if(coordinates) {
                this.setState({
                        sizeX : coordinates.sizeX,
                        sizeY : coordinates.sizeY
                    }, () => {

                        let message  = '';
                        //for each pair of input lines, place and move rover, get final position
                        for(var i=1; i<inputLines.length; i++) {
                            //set rover in position
                            let result = this.placeRover(inputLines[i]);
                            //if rover position is within the plateau, execute next line, else display invalid
                            if (result) {
                                 //execute commands for rover movements, if instructions is present for the rover
                                 if(inputLines.length > i+1) {
                                    this.moveRover(inputLines[i+1]);
                                    //get final position of rover
                                    message = message + "\n" + this.state.x + ' ' + this.state.y + ' ' + DIRECTIONS[this.state.facing];
                                 } else {
                                    message = message + "\nInvalid input";
                                 }
                            } else {
                                message = message + "\nInvalid input";
                            }
                            i++;
                        }
                        this.setState({outputMessage : message});
                    });
            } else {
                 this.setState({outputMessage : "Invalid input"});
            }
        } else {
            this.setState({outputMessage : "Invalid input"});
        }
    };

    //get the size for plateau, return top-right coordinates if valid input, else null
    getCoordinates = (inputLine) => {
        if(/^([0-9]+ [0-9]+$)/.test(inputLine)) {
            const inputSizeX = inputLine.substring(0, inputLine.indexOf(' '));
            const inputSizeY = inputLine.substring(inputLine.indexOf(' ')+1, inputLine.length);
            return {sizeX: parseInt(inputSizeX), sizeY: parseInt(inputSizeY)};
        }
        return null;
    };

    //set initial position of rover and direction it's facing,
    //return true if input is valid, else false
    placeRover = (inputLine) => {
        const {x, y, facing} = this.state;
        const inputX = inputLine.substring(0, inputLine.indexOf(' '));
        const inputY = inputLine.substring(inputLine.indexOf(' ')+1, inputLine.lastIndexOf(' '));
        const inputFacing = inputLine.substring(inputLine.lastIndexOf(' ')+1, inputLine.length);

        if (this.validPosition(inputX, inputY)) {
            this.state.x = parseInt(inputX);
            this.state.y = parseInt(inputY);
            this.state.facing = this.parseFacing(inputFacing);
            return true;
        }
        return false;
    };

    //convert facing input to numeric value for ease of calculation
    parseFacing = (facingChar) => {
        switch(facingChar) {
            case 'N':
            {
                return 0;
            }
            case 'E':
            {
                return 1;
            }
            case 'W':
            {
                return 2;
            }
            case 'S':
            {
                return 3;
            }
        }
    };

    //execute instructions to explore the plateau. For each command, rotate left/right 90* or move one grid forward. Ignore invalid command
    moveRover = (inputLine) => {
        let x = this.state.x;
        let y = this.state.y;
        let facing = this.state.facing;

        for(var i=0; i<inputLine.length; i++) {
            const command = inputLine.charAt(i);
            switch(command) {
                case 'L':
                {
                    facing = this.left(facing);
                    break;
                }
                case 'R':
                {
                    facing = this.right(facing);
                    break;
                }
                case 'M':
                {
                    let result = this.move(x, y, facing);
                    x = result.x;
                    y= result.y;
                    break;
                }
            }
        }
        this.state.x = x;
        this.state.y = y;
        this.state.facing = facing;
    };

    //rotates the robot in left
    left = (facing) => {
        return (facing === 0) ? 3 : facing - 1;
    };

    //rotates the robot in right
    right = (facing) => {
        return (facing + 1) % 4;
    };

    // Move the rover in the direction it's facing. Do nothing if the rover is on the edge of plateau
    move = (x, y, facing) => {
       let newX = x;
       let newY = y;
       const {sizeX, sizeY} = this.state;

       switch(facing) {
           case 0: // facing North
           {
               newY = (y < sizeY) ? (y + 1) : y;
               break;
           }
           case 1: // facing East
           {
               newX= (x < sizeX) ? (x + 1) : x;
               break;
           }
           case 2: // facing South
           {
               newY = (y > 0) ? (y - 1) : y;
               break;
           }
           case 3: // facing West
           {
                newX = (x > 0) ? (x - 1) : x;
                break;
           }
       }
        return {x: newX, y: newY};
    };

    // Check if the supplied position is within the plateau grid
    // x,y are coordinates to check
    // returns boolean
    validPosition = (x, y) => {
        const {sizeX, sizeY} = this.state;
        const patternX = new RegExp("^[0-" + sizeX + "]$");
        const patternY = new RegExp("^[0-" + sizeY + "]$");
        if(!patternX.test(x) || !patternY.test(y))
        {
            return false;
        }
        return true;
    };

    render(){
        const {outputMessage} = this.state;
        return(
            <div>
                <div>
                    <textarea name="inputValue" rows="20" value={this.state.inputValue || ''} onChange={this.changeHandler} />
                </div>
                <div>
                    <button className="execute" onClick={this.executeRover}>Execute</button>
                </div>
                <div>
                    <label>Rover Positions: </label>
                    {
                        outputMessage.split('\n').map((item, i) => {
                            return <p key={i}>{item}</p>;
                        })
                    }
                </div>
            </div>
        )
    }
}