function getPerson(name, age){
    this.name = name;
    this.age = age;
}

getPerson.prototype.walk = function (){
    console.log(`${this.name} is walking`);
    return 'hello'
}

let person = new getPerson('nidhi', 23);
console.log(person.walk());