## Workout/Progress Tracking
App for tracking workout attendance and progress, emphasis on mobile layout and mobile-friendly experience
React/Tailwind/Nextjs/GraphQL/MongoDB

## Goal

I created this site primarily to solve a few problems that I noticed with tracking progress in the gym:
- Excel layouts that force users to scroll through a long history of workouts to record a new workout session
- Spreadsheet templates that rely on formulas are inflexible
- Difficult to visualize progress across sessions
- No way to indicate when exercises were completed back-to-back in a superset

## Details

Core Features:
- Choose exercises to perform in workouts and add workouts to your program
- Record results, view past workouts, and track your progress on exercises (projected 1-rep max based on NSCA load chart https://www.nsca.com/contentassets/61d813865e264c6e852cadfe247eae52/nsca_training_load_chart.pdf)

![Screenshot 2023-09-26 231832](https://github.com/japeotter21/gymtrack/assets/97000604/195b2684-02af-4734-944c-a198b29a68cc)
![Screenshot 2023-10-02 153359](https://github.com/japeotter21/gymtrack/assets/97000604/613b8e6e-74af-46c5-a035-f9f374c67f74)
![Screenshot 2023-10-02 153700](https://github.com/japeotter21/gymtrack/assets/97000604/8e661849-0a97-4c08-bdc7-e870f77f79e1)
![Screenshot 2023-09-23 233505](https://github.com/japeotter21/gymtrack/assets/97000604/6c27066b-8537-40e4-86c8-9e47e91df404)
![Screenshot 2023-09-28 183309](https://github.com/japeotter21/gymtrack/assets/97000604/c6d8bedb-7571-4518-aa44-65a2908ae5f6)

To Do:
<p>✅ Progress tracking by exercise (chart)</p>
<p>✅ Create and edit workouts</p>
<p>✅ Drag and drop editing</p>
<p>✅ Reconfigure schema for GraphQL</p>
<p>✅ Show workout history</p>
<p>✅ Create and edit programs</p>
<p>✅ User flow and auth</p>
<p>✅ User associated data</p>
<p>✅ Add exercises and assign attributes (back/pull/etc.)</p>
<p>✅ duration tracking of exercises and workouts</p>
<p>⬜ Create workout routine templates</p>
<p>⬜ Audit/log requests</p>
<p>✅ Migrate React Scheduler to custom calendar</p>
<p>⬜ API cleanup (separate GraphQL service)</p>
<p>⬜ Configure progression to set target weights</p>
<p>✅ Cache page loads</p>
<p>⬜ New user flow</p>
<p>⬜ Upload old workouts</p>
<p>⬜ Share workouts</p>

Future: 
<p>⬜ AI workout progressions, plans and exercise recommendations</p>
<p>⬜ Migrate to Flutter</p>
