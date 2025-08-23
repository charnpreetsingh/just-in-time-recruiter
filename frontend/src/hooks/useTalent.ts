import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TalentWithMatch {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string | null;
  layoff_date: string | null;
  skills: string[];
  linkedin_url: string | null;
  email: string | null;
  match_score: number | null;
  match_reasons: string[] | null;
  role_id: string | null;
}

export const useTalent = () => {
  return useQuery({
    queryKey: ["talent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("talent")
        .select(`
          *,
          role_matches (
            match_score,
            match_reasons,
            role_id
          )
        `);

      if (error) throw error;

      // First, create a map of all talent
      const talentMap = new Map();
      
      // Process all talent and their role matches
      data.forEach((talent) => {
        // For each talent, create entries for each role match
        if (talent.role_matches && talent.role_matches.length > 0) {
          talent.role_matches.forEach((match) => {
            const talentWithMatch: TalentWithMatch = {
              id: talent.id,
              name: talent.name,
              title: talent.title,
              company: talent.company,
              location: talent.location,
              layoff_date: talent.layoff_date,
              skills: talent.skills || [],
              linkedin_url: talent.linkedin_url,
              email: talent.email,
              match_score: match.match_score || null,
              match_reasons: match.match_reasons || null,
              role_id: match.role_id || null,
            };
            talentMap.set(`${talent.id}_${match.role_id}`, talentWithMatch);
          });
        } else {
          // If no role matches, still include the talent with null role data
          const talentWithoutMatch: TalentWithMatch = {
            id: talent.id,
            name: talent.name,
            title: talent.title,
            company: talent.company,
            location: talent.location,
            layoff_date: talent.layoff_date,
            skills: talent.skills || [],
            linkedin_url: talent.linkedin_url,
            email: talent.email,
            match_score: null,
            match_reasons: null,
            role_id: null,
          };
          talentMap.set(talent.id, talentWithoutMatch);
        }
      });
      
      // Convert the map to an array and return
      return Array.from(talentMap.values());
    },
  });
};

export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .eq("status", "active");

      if (error) throw error;
      return data;
    },
  });
};