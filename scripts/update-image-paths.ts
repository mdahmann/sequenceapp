import * as fs from 'fs';
import * as path from 'path';

interface YogaPose {
  id: number;
  english_name: string;
  sanskrit_name: string;
  url_png: string;
  [key: string]: any;
}

const posesPath = path.join(process.cwd(), 'public', 'yoga-data', 'poses.json');
const poses = JSON.parse(fs.readFileSync(posesPath, 'utf8')) as YogaPose[];

const updatedPoses = poses.map((pose: YogaPose) => ({
  ...pose,
  url_png: pose.url_png.replace('/images/poses/', '/yoga-data/images/')
}));

fs.writeFileSync(posesPath, JSON.stringify(updatedPoses, null, 2)); 