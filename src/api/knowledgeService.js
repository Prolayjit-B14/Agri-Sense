/**
 * AgriSense Knowledge Service
 * Consolidated agronomic knowledge from JS databases and CSV files.
 */

import { parseCSV } from '../data/core/AgronomyUtils';
import { CROP_SPECS, METADATA } from '../data/core/CropDatabase';

// CSV URLs
import compostCsv from '../data/core/IndustrialCompostSpecs.csv?url';
import fertilizerCsv from '../data/core/IndustrialFertilizerSpecs.csv?url';
import logicCsv from '../data/core/logic.csv?url';
import pestCsv from '../data/core/pest.csv?url';
import suitabilityCsv from '../data/geo/CropSuitabilityData_Final.csv?url';

/**
 * Fetches and aggregates all agronomic knowledge for the AI.
 */
export const getAgronomyKnowledge = async () => {
  try {
    const [compost, fertilizer, logic, pest, suitability, districts] = await Promise.all([
      fetch(compostCsv).then(r => r.text()),
      fetch(fertilizerCsv).then(r => r.text()),
      fetch(logicCsv).then(r => r.text()),
      fetch(pestCsv).then(r => r.text()),
      fetch(suitabilityCsv).then(r => r.text()),
      fetch(suitabilityCsv).then(r => r.text()), // Using suitability for now as placeholder for district
    ]);

    const parsedCompost = parseCSV(compost).slice(0, 100);
    const parsedFertilizer = parseCSV(fertilizer).slice(0, 100);
    const parsedLogic = parseCSV(logic).slice(0, 100);
    const parsedPest = parseCSV(pest).slice(0, 100);
    const parsedSuitability = parseCSV(suitability).slice(0, 50);

    // Create an extremely dense and structured summary for the AI
    return {
      cropStandards: Object.entries(CROP_SPECS).slice(0, 50).map(([crop, specs]) => 
        `${crop}: N:${specs.n.join('-')}, P:${specs.p.join('-')}, K:${specs.k.join('-')}, pH:${specs.ph.join('-')}`
      ),
      fertilizerDatabase: parsedFertilizer.map(f => `${f.crop}: ${f.primaryfertilizers} (Logic: ${f.industriallogic})`),
      compostDatabase: parsedCompost.map(c => `${c.crop}: ${c.dosage} of ${c.composttype} at ${c.applicationstage}`),
      pestDatabase: parsedPest.map(p => `${p.crop}: Most common: ${p.most_common}. Triggered by ${p.weather_trigger} weather. Advice: ${p.all_pests}`),
      regionalLogic: parsedLogic.map(l => `${l.crop}: Suited for ${l.location} in ${l.climate_temp} climates. Special: ${l.special_logic}`),
      suitabilityHighlights: parsedSuitability.map(s => `${s.label}: High demand in ${s.season}, thrives in ${s.soil_type}`),
      systemMetadata: {
        totalIndustrialCrops: Object.keys(CROP_SPECS).length,
        dataSources: ["IndustrialCompostSpecs.csv", "IndustrialFertilizerSpecs.csv", "logic.csv", "pest.csv", "CropDatabase.js"],
        version: "20.0.0-FullAudit"
      }
    };
  } catch (error) {
    console.error("Knowledge Fetch Error:", error);
    return { error: "Could not load full knowledge base." };
  }
};
