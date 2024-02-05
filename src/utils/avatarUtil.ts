import { take } from "ramda";

const avatarUtil = (fullName: string) => {
  const formattedName = fullName.trim().split(" ");
  let initials = "";

  // this is to get the initials
  if (formattedName.length > 1) {
    const firstLetter = take(1, formattedName[0]).toUpperCase();
    const secondLetter = take(1, formattedName[1]).toUpperCase();
    initials = firstLetter + secondLetter;
  } else {
    initials = take(1, formattedName[0]).toUpperCase();
  }

  // this is to generate the avatar color code
  const getHashOfString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);
    return hash;
  };

  const hRange = [30, 360];
  const sRange = [30, 100];
  const lRange = [10, 100];

  const normalizeHash = (hash: number, min: number, max: number) => {
    return Math.floor((hash % (max - min)) + min);
  };

  const generateHSL = (name: string) => {
    const hash = getHashOfString(name);
    const h = normalizeHash(hash, hRange[0], hRange[1]);
    const s = normalizeHash(hash, sRange[0], sRange[1]);
    const l = normalizeHash(hash, lRange[0], lRange[1]);
    return [h, s, l];
  };

  const [h, s, l] = generateHSL(fullName.trim());

  return {
    initials: initials,
    color: `hsl(${h}, ${s}%, ${l}%)`,
  };
};

export default avatarUtil;
