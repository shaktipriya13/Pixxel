// hooks/use-plan-access.js: a custom hook to handle plan access to users
import { useAuth } from "@clerk/nextjs";

export function usePlanAccess() {
  const { has } = useAuth();

  const isPro = has?.({ plan: "pro" }) || false; //if the user has pro plan then return pro else return false
  const isFree = !isPro; // If not pro, then free (default)

  // Define which tools are available for each plan
  const planAccess = {
    // we provide access to diff diff tools acc. to the plan a user has
    // Free plan tools
    resize: true,
    crop: true,
    adjust: true,
    text: true,

    // Pro-only tools
    background: isPro,
    ai_extender: isPro,
    ai_edit: isPro,
  };

  // Helper function to check if user has access to a specific tool
  const hasAccess = (toolId) => {
    return planAccess[toolId] === true;
  };

  // we can get list of the restricted tools that user doesn't have access to
  const getRestrictedTools = () => {
    return Object.entries(planAccess)
      .filter(([_, hasAccess]) => !hasAccess)
      .map(([toolId]) => toolId);
  };

  // Check if user has reached project limits
  const canCreateProject = (currentProjectCount) => {
    if (isPro) return true;
    return currentProjectCount < 5; // Free limit
  };

  // Check if user has reached export limits
  const canExport = (currentExportsThisMonth) => {
    if (isPro) return true;
    return currentExportsThisMonth < 20;
  };

  return {
    // all below variables will be used in diff. pages of the project
    userPlan: isPro ? "pro" : "free_user",
    isPro,
    isFree,
    hasAccess,
    planAccess,
    getRestrictedTools,
    canCreateProject,
    canExport,
  };
}
