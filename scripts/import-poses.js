import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function importPoses() {
  try {
    // Read the poses data
    const rawPosesData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../public/yoga-data/poses.json'), 'utf8')
    );

    // Remove the id field from each pose
    const posesData = rawPosesData.map(({ id, ...pose }) => pose);

    console.log(`Found ${posesData.length} poses to import`);

    // Insert poses in batches of 50
    for (let i = 0; i < posesData.length; i += 50) {
      const batch = posesData.slice(i, i + 50);
      
      const { data, error } = await supabase
        .from('poses')
        .insert(batch)
        .select();

      if (error) {
        console.error('Error inserting batch:', error);
        continue;
      }

      console.log(`Inserted batch ${i / 50 + 1}, ${data.length} poses`);
    }

    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

importPoses(); 