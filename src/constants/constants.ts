export const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
  switch (severity) {
    case 'high':
      return 'border-destructive/30 bg-destructive/10';
    case 'medium':
      return 'border-yellow-500/30 bg-yellow-500/10';
    case 'low':
      return 'border-green-500/30 bg-green-500/10';
    default:
      return 'border-border bg-card';
  }
};
