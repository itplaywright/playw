const fs = require('fs');
let d = fs.readFileSync('src/components/dashboard/DashboardClient.tsx', 'utf8');

d = d.replace(/selectedTrack\.description/g, 'getTrackDesc(selectedTrack)');
d = d.replace(/task\.description/g, 'getTaskDesc(task)');

fs.writeFileSync('src/components/dashboard/DashboardClient.tsx', d);
