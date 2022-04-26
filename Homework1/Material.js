class Material{
    constructor(diffuse,specular,ambient){
        this._diffuse =this._ambient = this._specular = this._emission = vec4();
        this._diffuse[3] = 1;
        this._ambient[3] = 1;
        this._specular[3] = 1;
        this._shininess = 0;
    }

    get diffuse(){return this._diffuse;}
    set diffuse(diffuse){this._diffuse = diffuse;}

    get ambient(){return this._ambient;}
    set ambient(ambient){this._ambient = ambient;}

    get specular(){return this._specular;}
    set specular(specular){this._specular = specular;}

    get shininess(){return this._shininess;}
    set shininess(shininess){this._shininess = shininess;}

    get emission(){return this._emission;}
    set emission(emission){this._emission = emission;}
}