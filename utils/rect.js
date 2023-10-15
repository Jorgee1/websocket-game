export class Rect {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} w 
     * @param {number} h 
     */
    constructor (x, y, w, h) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }

    toDict () {
        return {
            x: this.x,
            y: this.y,
            w: this.w,
            h: this.h
        }
    }
}
