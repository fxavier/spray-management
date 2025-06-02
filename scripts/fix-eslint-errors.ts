// This script documents all the ESLint fixes needed for the build
// Run each fix manually or use automated tools

const fixes = [
  // Actors pages
  {
    file: './app/actors/[id]/edit/page.tsx',
    fixes: [
      'Add fetchActor to useEffect dependencies or use useCallback',
      'Remove unused error variable in catch blocks'
    ]
  },
  {
    file: './app/actors/new/page.tsx',
    fixes: ['Remove unused error variable in catch block']
  },
  {
    file: './app/actors/page.tsx',
    fixes: ['Add router to useEffect dependencies']
  },
  
  // API routes - fix any types
  {
    file: './app/api/communities/[id]/route.ts',
    fixes: ['Replace any with proper types']
  },
  {
    file: './app/api/communities/route.ts',
    fixes: ['Replace any with proper types']
  },
  {
    file: './app/api/dashboard/spray-progress/route.ts',
    fixes: ['Replace any with proper types']
  },
  {
    file: './app/api/districts/[id]/route.ts',
    fixes: ['Replace any with proper types']
  },
  {
    file: './app/api/districts/route.ts',
    fixes: ['Replace any with proper types']
  },
  {
    file: './app/api/localities/[id]/route.ts',
    fixes: ['Replace any with proper types']
  },
  {
    file: './app/api/localities/route.ts',
    fixes: ['Replace any with proper types']
  },
  {
    file: './app/api/provinces/[id]/route.ts',
    fixes: ['Replace any with proper types']
  },
  {
    file: './app/api/provinces/route.ts',
    fixes: ['Remove unused imports and variables', 'Replace any with proper types']
  },
  {
    file: './app/api/reports/detailed/route.ts',
    fixes: ['Replace any with proper types']
  },
  {
    file: './app/api/reports/export/route.ts',
    fixes: ['Replace any with proper types']
  },
  {
    file: './app/api/reports/summary/route.ts',
    fixes: ['Replace any with proper types']
  },
  {
    file: './app/api/spray-configurations/[id]/route.ts',
    fixes: ['Replace any with proper types']
  },
  {
    file: './app/api/spray-configurations/route.ts',
    fixes: ['Replace any with proper types']
  },
  {
    file: './app/api/spray-totals/[id]/route.ts',
    fixes: ['Replace any with proper types']
  },
  {
    file: './app/api/spray-totals/route.ts',
    fixes: ['Replace any with proper types']
  },
  
  // Other pages
  {
    file: './app/auth/signin/page.tsx',
    fixes: ['Remove unused imports', 'Replace any with proper types', 'Remove unused error variables']
  },
  {
    file: './app/dashboard/page.tsx',
    fixes: ['Remove unused imports', 'Add dependencies to useEffect', 'Replace any with proper types']
  },
  {
    file: './app/locations/communities/[id]/edit/page.tsx',
    fixes: ['Add fetchCommunityAndLocalities to useEffect dependencies']
  },
  {
    file: './app/locations/districts/[id]/edit/page.tsx',
    fixes: ['Add fetchDistrict to useEffect dependencies', 'Remove unused error variables']
  },
  {
    file: './app/locations/districts/new/page.tsx',
    fixes: ['Remove unused error variable']
  },
  {
    file: './app/locations/localities/[id]/edit/page.tsx',
    fixes: ['Add fetchLocalityAndDistricts to useEffect dependencies']
  },
  {
    file: './app/locations/page.tsx',
    fixes: ['Remove unused variables', 'Add router to useEffect dependencies']
  },
  {
    file: './app/locations/provinces/[id]/edit/page.tsx',
    fixes: ['Add fetchProvince to useEffect dependencies', 'Remove unused error variables']
  },
  {
    file: './app/reports/page.tsx',
    fixes: ['Remove unused imports', 'Replace any with proper types', 'Add generateReport to useEffect dependencies']
  },
  {
    file: './app/spray-config/[id]/edit/page.tsx',
    fixes: ['Add fetchConfiguration to useEffect dependencies', 'Remove unused error variables']
  },
  {
    file: './app/spray-config/new/page.tsx',
    fixes: ['Remove unused imports', 'Add dependencies to useEffect']
  },
  {
    file: './app/spray-config/page.tsx',
    fixes: ['Remove unused imports', 'Add router to useEffect dependencies']
  },
  {
    file: './app/spray-totals/[id]/edit/page.tsx',
    fixes: ['Remove unused imports', 'Add dependencies to useEffect', 'Replace any with proper types']
  },
  {
    file: './app/spray-totals/[id]/page.tsx',
    fixes: ['Remove unused variables', 'Add fetchSprayTotal to useEffect dependencies']
  },
  {
    file: './app/spray-totals/new/page.tsx',
    fixes: ['Add dependencies to useEffect', 'Replace any with proper types']
  },
  {
    file: './app/spray-totals/page.tsx',
    fixes: ['Remove unused imports and variables', 'Add fetchSprayTotals to useEffect dependencies']
  },
  
  // Components
  {
    file: './components/layout/app-sidebar.tsx',
    fixes: ['Remove unused imports']
  },
  {
    file: './lib/auth.ts',
    fixes: ['Replace any with proper types']
  },
  {
    file: './lib/hooks/use-toast.ts',
    fixes: ['Fix actionTypes usage']
  }
]

console.log('ESLint fixes needed:', fixes.length, 'files')
export { fixes }