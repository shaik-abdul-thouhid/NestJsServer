import { randomBytes } from "crypto";
import pkg from "jsonwebtoken";

const { sign } = pkg;

const random = randomBytes(64).toString('hex');
const password = '$Thouhid786'
const encode = sign(password, random);

console.log(encode + random);

"eyJhbGciOiJIUzI1NiJ9.JFRob3VoaWQ3ODY.2WsdDO2PTxtdlWT_W8Vy9dniQCwASgvts6wPXmEGeFYf384e1d67da1dbd12ffe83d3bfbc78afbdbab14bbc48a1fdbc36fd8b024294694428584c31922ce31241eb0ba50606505420b5eb22f0b79ea1eb4c91502d5c7a"