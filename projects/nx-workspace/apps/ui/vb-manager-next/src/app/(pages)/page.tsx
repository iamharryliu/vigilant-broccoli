import { WeatherComponent } from '../components/weather.component';
import { GoogleTasksComponent } from '../components/google-tasks.component';
import { GcloudAuthStatusComponent } from '../components/gcloud-auth-status.component';
import { WireguardStatusComponent } from '../components/wireguard-status.component';
import { GithubRepoActionStatusBadges } from '../components/github-actions-status.component';
import { TaskListDebugComponent } from '../components/task-list-debug.component';
import { DjDownloadComponent } from '../components/dj-download.component';

export default function Page() {
  return (
    <div className="grid grid-cols-4 gap-4 h-full">
      <div className="flex flex-col gap-4">
        <GoogleTasksComponent />
        <TaskListDebugComponent />
      </div>
      <div className="flex flex-col gap-4">
        <GoogleTasksComponent taskListId="cXJUTkpUQzZ6bTBpQjNybA" />
      </div>
      <div className="flex flex-col gap-4">
        <WeatherComponent />
        <DjDownloadComponent />
      </div>
      <div className="flex flex-col gap-4">
        <GcloudAuthStatusComponent />
        <WireguardStatusComponent />
        <GithubRepoActionStatusBadges repoUrl="https://github.com/iamharryliu/vigilant-broccoli" />
      </div>
    </div>
  );
}
