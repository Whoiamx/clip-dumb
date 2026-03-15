import { nanoid } from "nanoid";

interface RenderJob {
  id: string;
  progress: number;
  done: boolean;
  url?: string;
  error?: string;
}

// In-memory render jobs (loses state on restart — see TASKS.md)
const renderJobs = new Map<string, RenderJob>();

export function startRender(project: any, exportSettings: any): string {
  const renderId = nanoid();

  const job: RenderJob = {
    id: renderId,
    progress: 0,
    done: false,
  };

  renderJobs.set(renderId, job);

  // Simulate render progress (real Remotion rendering not yet implemented — see TASKS.md)
  const totalSteps = 20;
  let step = 0;

  const interval = setInterval(() => {
    step++;
    job.progress = Math.min((step / totalSteps) * 100, 100);

    if (step >= totalSteps) {
      clearInterval(interval);
      job.done = true;
      job.progress = 100;
      // Placeholder URL — real implementation would serve the rendered file
      job.url = `/uploads/render-${renderId}.mp4`;
    }
  }, 1000);

  return renderId;
}

export function getRenderStatus(renderId: string): RenderJob | null {
  return renderJobs.get(renderId) || null;
}
