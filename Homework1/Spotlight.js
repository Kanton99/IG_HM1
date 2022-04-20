class Spotlight{
    constructor(opening = 10){
        this._transform;
        this._opening = opening;
        this._direction = vec4(),
        this._direction[2] = this._direction[3] = 1;
    }

    get transform(){
        return this._transform;
    }

    set transform(transform){
        this._transform = transform;
        this._direction = mult(this._transform, this._direction);
    }

    get opening(){
        return this._opening;
    }

    set opening(degree){
        this._opening = degree;
    }

    get direction(){
        return this._direction;
    }
}