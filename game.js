var gamestate // think of this one as an enum with values "a" "o" and "b"
var selectedNumber
var selectedOperation
var viewMode
var goal
var numberLeft
var workFinishes
var numberInputs = []
var operatorInputs = []

const instruct = document.getElementById("instruct")

// resets the game in all the ways it has been changed so that it is ready for the next play through
function newGame() {
    gamestate = "a"
    selectedNumber = null
    selectedOperation = null
    workFinishes = []
    let workArea = document.getElementById("work-area")
    while (workArea.children[1]) {
        workArea.removeChild(workArea.children[1]);
    }
    document.getElementById("new-game-menu").classList = ["hidden"]
    document.getElementById("menu").classList = []

    numberInputs.forEach(num => {
        num.node.remove()
    })
    numberInputs = []

    operatorInputs.forEach(op => {
        op.node.remove()
    })
    operatorInputs = []

    instruct.innerText = "Press Start Game"
}
newGame()
document.getElementById("new-button").addEventListener("click", newGame)

// pythagnian theorom
function dis(a, b) {
    return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2))
}

// rounds a number to the 100s place
function round(number) {
    return Math.round(number * 100) / 100
}

// A class for doing math with Complex numbers
class Complex {
    constructor(real, imaginary) {
        this.real = real
        this.imaginary = imaginary
    }

    copy() {
        return new Complex(this.real, this.imaginary)
    }

    add(input) {
        return new Complex(
            this.real + input.real,
            this.imaginary + input.imaginary
        )
    }

    multiply(input) {
        return new Complex(
            this.real * input.real - this.imaginary * input.imaginary,
            this.real * input.imaginary + this.imaginary * input.real
        )
    }

    subtract(input) {
        return new Complex(
            this.real - input.real,
            this.imaginary - input.imaginary
        )
    }

    divide(input) {
        let d = input.real*input.real + input.imaginary*input.imaginary
        console.log(d)
        return new Complex(
            (this.real * input.real + this.imaginary * input.imaginary) / d,
            (this.imaginary * input.real - this.real * input.imaginary) / d
        )
    }

    get magnitude() {
        return dis(this.real, this.imaginary)
    }

    get angle() {
        return Math.atan2(this.imaginary, this.real)
    }

    // return a string of the complex number in "1 +1i" format
    formatComp() {
        if (Math.abs(this.imaginary) < 0.01) {
            return `${round(this.real)}`
        } else if (Math.abs(this.real) < 0.01) {
            return `${round(this.imaginary)}i`
        } else if (this.imaginary > 0) {
            return `${round(this.real)} +${round(this.imaginary)}i`
        } else {
            return `${round(this.real)} -${round(-this.imaginary)}i`
        }
    }

    // return a string of the complex number in "r:1.41 θ:45" format
    formatPolar() {
        return `r:${round(this.magnitude)} θ:${Math.round((this.angle / Math.PI * 180))}`
    }

    // return a string of the complex number in the selected format
    format() {
        if (viewMode) {
            return this.formatComp()
        } else {
            return this.formatPolar()
        }
    }

    // returns the distance to anouther complex number
    disTo(input) {
        return dis(this.real - input.real, this.imaginary - input.imaginary)
    }

    // makes a new complex number based on magnatude and angle instead of real and imaginary componants
    static newFromPolar(mag, angle) {
        return new Complex(
            mag * Math.cos(angle),
            mag * Math.sin(angle)
        )
    }

    // creates a new complex number based on the games domain game mode setting
    static newFromGameMode(gamemode) {
        switch (gamemode) {
            case "N": return new Complex(Math.floor(Math.random()*10+1),0);
            case "Z": return new Complex(Math.floor(Math.random()*11-5),0);
            case "R": return new Complex(Math.random()*8-4,0);
            case "Ce": return Complex.newFromPolar(Math.floor(Math.random()*4+1), Math.floor(Math.random()*4)*Math.PI/2);
            case "C": return Complex.newFromPolar(Math.random()*3, Math.random()*Math.PI*2);
        }
    }
}

// formates the text used for the work box
function workText(a, op, b, result) {
    switch (op) {
        case "+":
            return`[${a.formatComp()}] + [${b.formatComp()}] = [${result.formatComp()}]`
        case "*":
            if (modeToggle.disabled)
                return`[${a.formatComp()}] x [${b.formatComp()}] = [${result.formatComp()}]`
            else
                return`[${a.formatPolar()}] x [${b.formatPolar()}] = [${result.formatPolar()}]`
        case "-":
            return`[${a.formatComp()}] - [${b.formatComp()}] = [${result.formatComp()}]`
        case "/":
            if (modeToggle.disabled)
                return `[${a.formatComp()}] / [${b.formatComp()}] = [${result.formatComp()}]`
            else
                return `[${a.formatPolar()}] / [${b.formatPolar()}] = [${result.formatPolar()}]`
    }
}

// adds text to the work box
function addWork(a, op, b, result) {
    workFinishes.push(result)
    const text = workText(a, op, b, result)
    const paragraph = document.createElement("p")
    const node = document.createTextNode(text)
    paragraph.append(node)
    document.getElementById("work-area").appendChild(paragraph)
}

// a wrapper for the number buttons that handles all the logic for them
class NumberInput {
    constructor(node, value) {
        this.node = node
        this.value = value
        this.updateNumber()
        this._mode = "normal"
        node.onclick = () => this.click();
    }

    updateNumber() {
        this.node.innerText = this.value.format()
    }

    // logic that runs when the button is clicked
    click() {
        if (this.mode == "used") return
        if (this.mode == "selected") {
            if (gamestate == "o") {
                gamestate = "a"
                this.mode = "normal"
                selectedNumber = null
                updateDisabledAll()
                updateInstruct()
            }
            return
        }
        if (gamestate == "a") {
            if (numberLeft == 1) {
                this.mode = "used"
                updateDisabledAll()
                selectedNumber = this
                endGame()
                return
            }
            this.mode = "selected"
            selectedNumber = this
            gamestate = "o"
            updateDisabledAll()
            updateInstruct()
        } else {
            this.combine()

            this.mode = "normal"
            selectedNumber.mode = "used"
            selectedOperation.mode = "used"

            selectedNumber = null
            selectedOperation = null

            gamestate = "a"
            numberLeft--
            updateDisabledAll()
            updateInstruct()
        }
    }

    get mode() {
        return this._mode
    }

    //changing the mode changes all the varrious properties of the button too
    set mode(mode) {
        this._mode = mode
        let node = this.node
        if (mode == "normal") {
            node.classList = []
        } else {
            node.classList = [mode]
        }
        this.updateDisabled()
    }

    // logic for ensuring that the button is in the correct disabled state
    updateDisabled() {
        switch (this.mode) {
            case "normal":
                this.node.disabled = (
                    gamestate == "o" ||
                    gamestate == "b" && selectedOperation.node.innerText == "/" && this.value.disTo(new Complex(0,0)) < 0.01
                )
            break;
            case "selected":
                this.node.disabled = (gamestate == "b")
            break;
            case "used":
                this.node.disabled = true
            break;
        }
    }

    // combines the number (this would be the second number) with the first number (selectedNumber)
    combine() {
        let newValue
        const op = selectedOperation.node.innerText
        switch (op) {
            case "+":
                newValue = selectedNumber.value.add(this.value)
                break;
            case "*":
                newValue = selectedNumber.value.multiply(this.value)
                break;
            case "-":
                newValue = selectedNumber.value.subtract(this.value)
                break;
            case "/":
                newValue = selectedNumber.value.divide(this.value)
                break;
        }
        addWork(selectedNumber.value, op, this.value, newValue)
        this.value = newValue
        this.updateNumber()
    }
}

// wrapper class for the opperation buttons
class OperatorInput {
    constructor(node) {
        this.node = node
        this._mode = "normal"
        node.onclick = () => this.click();
    }

    get mode() {
        return this._mode
    }

    //changing the mode changes all the varrious properties of the button too
    set mode(mode) {
        this._mode = mode
        let node = this.node
        if (mode == "normal") {
            node.classList = []
        } else {
            node.classList = [mode]
        }
        this.updateDisabled()
    }

    // logic for ensuring that the button is in the correct disabled state
    updateDisabled() {
        switch (this.mode) {
            case "normal":
                this.node.disabled = (gamestate == "a" || gamestate == "b")
            break;
            case "selected":
                this.node.disabled = false
            break;
            case "used":
                this.node.disabled = true
            break;
        }
    }

    // logic that runs when the button is clicked
    click() {
        if (this.mode == "used") return
        if (gamestate == "b" && this.mode == "selected") {
            gamestate = "o"
            this.mode = "normal"
            selectedOperation = null
            updateDisabledAll()
            updateInstruct()
            return
        }
        this.mode = "selected"
        //gamestate == "o"
        gamestate = "b"
        selectedOperation = this
        updateDisabledAll()
        updateInstruct()
    }
}

const modeToggle = document.getElementById('view-mode')
viewMode = modeToggle.checked
modeToggle.onclick = () => setMode()

// runs updateDisabled() on all the butons
function updateDisabledAll() {
    operatorInputs.forEach(op => {
        op.updateDisabled()
    })
    numberInputs.forEach(num => {
        num.updateDisabled()
    })
}

// updates the instruct for during the main loop of gameplay
function updateInstruct() {
    switch (gamestate) {
        case "a":
            if (numberLeft == 1) {
                instruct.innerText = "Click Num to End"
                break;
            }
        case "b":
            instruct.innerText = "Select A Number"
            break;
        case "o":
            instruct.innerText = "Select An Operator"
        break;
    }
}

// generates the goal by simulating play randomly
function generateGoal() {
    let numbers = []
    let operators = []

    // gets all the current numbers
    numberInputs.forEach(num => {
        numbers.push(num.value.copy())
    })
    operatorInputs.forEach(op => {
        operators.push(op.node.innerText)
    })

    //simulates combining them together
    function combine(numIndex1, numIndex2, opperatorIndex) {
        let newNum
        const num1 = numbers[numIndex1]
        const num2 = numbers[numIndex2]
        const opperator = operators[opperatorIndex]
        switch (opperator) {
            case "+":
                newNum = num1.add(num2)
                break;
            case "*":
                newNum = num1.multiply(num2)
                break;
            case "-":
                newNum = num1.subtract(num2)
                break;
            case "/":
                newNum = num1.divide(num2)
                break;
        }
        console.log(workText(num1, opperator, num2, newNum))
        if (numIndex1 > numIndex2) {
            numbers.splice(numIndex1, 1)
            numbers.splice(numIndex2, 1)
        } else {
            numbers.splice(numIndex2, 1)
            numbers.splice(numIndex1, 1)
        }
        numbers.push(newNum)
        operators.splice(opperatorIndex, 1)
    }

    while (numbers.length > 1) {
        // chooses two random numbers in a way that ensures they are not the same number
        let numIndex1 = Math.floor(Math.random() * numbers.length)
        let numIndex2 = Math.floor(Math.random() * (numbers.length - 1))
        if (numIndex1 == numIndex2) numIndex2++

        // tries to prevent dividing by zero
        if (numbers[numIndex2].disTo(new Complex(0,0)) < 0.01) {
            let temp = numIndex2
            numIndex2 = numIndex1
            numIndex1 = temp
        }
        if (numbers[numIndex2].disTo(new Complex(0,0)) < 0.01) {
            alert("An extreemly rare divide by zero error failed to be mitigated, please reload the page")
        }

        const opperatorIndex = Math.floor(Math.random() * operators.length)

        combine(numIndex1, numIndex2, opperatorIndex)
    }

    return numbers[0]

}

// updates the goal text for the correct format
function updateGoal() {
    document.getElementById("goal").innerText = goal.format()
}

//sets the gamestate
function setMode() {
    viewMode = modeToggle.checked
    numberInputs.forEach(num => num.updateNumber())
    updateGoal()
}

// ends the game
function endGame() {
    numberInputs.forEach(num => {
        let direction = Complex.newFromPolar(150,Math.random()*Math.PI*2)
        num.node.style.transform = `translate(${direction.real+50}vw,${direction.imaginary}vh)`
        num.node.classList = ["runaway"]
    })
    operatorInputs.forEach(num => {
        let direction = Complex.newFromPolar(150,Math.random()*Math.PI*2)
        num.node.style.transitionDelay = `${Math.random()}s`
        num.node.style.transform = `translate(${direction.real}vw,${direction.imaginary}vh)`
        num.node.classList = ["runaway"]
    })

    document.getElementById("new-game-menu").classList = []

    let win = selectedNumber.value.disTo(goal) < 0.01;
    document.getElementById("game-message").innerText = win?"You Won!":"Game Over!"
    document.getElementById("looser-text").hidden = win

    let bestNum = selectedNumber.value
    workFinishes.forEach(num => {
        if (num.disTo(goal) < bestNum.disTo(goal)) {
            bestNum = num
        }
    })
    document.getElementById("looser-closest").innerText = bestNum.formatComp()
    document.getElementById("looser-distance").innerText = bestNum.disTo(goal)

    if (win) {
        let wins = document.getElementById("wins")
        wins.innerText = Number(wins.innerText) + 1
    } else {
        let loses = document.getElementById("loses")
        loses.innerText = Number(loses.innerText) + 1
    }

    instruct.innerText = "Click New"
}

function startGame () {
    const size = gameSettings.size.value

    if ("NZR".includes(gameSettings.domain.value)) {
        modeToggle.disabled = true
        modeToggle.checked = true
    } else {
        modeToggle.disabled = false
    }

    numberLeft = size

    numberInputs = []
    let parent = document.getElementById("number-input")
    parent.classList = [`n${size}`]
    for (let i = 0; i < size; i++) {
        const button = document.createElement('button')
        button.classList = ["used"]
        parent.appendChild(button)
        button.classList = []
        numberInputs.push(new NumberInput(button, Complex.newFromGameMode(gameSettings.domain.value)))
    }

    let allowedSymbols = "";
    if (gameSettings.addition.checked) allowedSymbols+= "+"
    if (gameSettings.multiplication.checked) allowedSymbols+= "*"
    if (gameSettings.subtraction.checked) allowedSymbols+= "-"
    if (gameSettings.division.checked) allowedSymbols+= "/"

    operatorInputs = []
    parent = document.getElementById("operator-input")
    parent.classList = [`n${size - 1}`]
    for (let i = 0; i < size - 1; i++) {
        const button = document.createElement('button')
        button.innerText = allowedSymbols.charAt(i%allowedSymbols.length)
        button.disabled = true
        button.classList = ["used"]
        parent.appendChild(button)
        button.classList = []
        operatorInputs.push(new OperatorInput(button))
    }

    gamestate = "a"

    goal = generateGoal()
    updateGoal()
    
    setMode()
    updateInstruct()
}