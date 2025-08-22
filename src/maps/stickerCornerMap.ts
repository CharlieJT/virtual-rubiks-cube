// Sticker corner map: key = "x,y,z:face" where x,y,z are grid indices 0..2; value = [bl, br, tr, tl]
// Order: bottom-left, bottom-right, top-right, top-left (face-local when looking directly at that face)
// Populate / edit entries here to refine specific stickers. Omitted keys default to all rounded (true).
const STICKER_CORNER_MAP: Record<string, [boolean, boolean, boolean, boolean]> =
  {
    // FRONT face (z=2)
    "0,0,2:front": [false, false, false, false],
    "1,0,2:front": [false, false, true, true],
    "2,0,2:front": [false, false, false, false],
    "0,1,2:front": [false, true, true, false],
    "1,1,2:front": [true, true, true, true],
    "2,1,2:front": [true, false, false, true],
    "0,2,2:front": [false, false, false, false],
    "1,2,2:front": [true, true, false, false],
    "2,2,2:front": [false, false, false, false],
    // BACK face (z=0)
    "0,0,0:back": [false, false, false, false],
    "1,0,0:back": [false, false, true, true],
    "2,0,0:back": [false, false, false, false],
    "0,1,0:back": [true, false, false, true],
    "1,1,0:back": [true, true, true, true],
    "2,1,0:back": [false, true, true, false],
    "0,2,0:back": [false, false, false, false],
    "1,2,0:back": [true, true, false, false],
    "2,2,0:back": [false, false, false, false],
    // RIGHT face (x=2)
    "2,0,0:right": [false, false, false, false],
    "2,0,1:right": [false, false, true, true],
    "2,0,2:right": [false, false, false, false],
    "2,1,0:right": [true, false, false, true],
    "2,1,1:right": [true, true, true, true],
    "2,1,2:right": [false, true, true, false],
    "2,2,0:right": [false, false, false, false],
    "2,2,1:right": [true, true, false, false],
    "2,2,2:right": [false, false, false, false],
    // LEFT face (x=0)
    "0,0,0:left": [false, false, false, false],
    "0,0,1:left": [false, false, true, true],
    "0,0,2:left": [false, false, false, false],
    "0,1,0:left": [false, true, true, false],
    "0,1,1:left": [true, true, true, true],
    "0,1,2:left": [true, false, false, true],
    "0,2,0:left": [false, false, false, false],
    "0,2,1:left": [true, true, false, false],
    "0,2,2:left": [false, false, false, false],
    // TOP face (y=2)
    "0,2,0:top": [false, false, false, false],
    "1,2,0:top": [true, true, false, false],
    "2,2,0:top": [false, false, false, false],
    "0,2,1:top": [false, true, true, false],
    "1,2,1:top": [true, true, true, true],
    "2,2,1:top": [true, false, false, true],
    "0,2,2:top": [false, false, false, false],
    "1,2,2:top": [false, false, true, true],
    "2,2,2:top": [false, false, false, false],
    // BOTTOM face (y=0)
    "0,0,0:bottom": [false, false, false, false],
    "1,0,0:bottom": [false, false, true, true],
    "2,0,0:bottom": [false, false, false, false],
    "0,0,1:bottom": [false, true, true, false],
    "1,0,1:bottom": [true, true, true, true],
    "2,0,1:bottom": [true, false, false, true],
    "0,0,2:bottom": [false, false, false, false],
    "1,0,2:bottom": [true, true, false, false],
    "2,0,2:bottom": [false, false, false, false],
  };

export default STICKER_CORNER_MAP;
