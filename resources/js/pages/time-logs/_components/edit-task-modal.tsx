import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { router, useForm } from '@inertiajs/react';

interface EditTaskModalProps {
    task: {
        id: number;
        work_date: string;
        description: string;
        hours: number;
        minutes: number;
    };
}

export function EditTaskModal({ task }: EditTaskModalProps) {
    const { data, setData, put, processing, errors } = useForm<{
        work_date: Date;
        description: string;
        hours: number;
        minutes: number;
    }>({
        work_date: new Date(task.work_date),
        description: task.description,
        hours: task.hours,
        minutes: task.minutes,
    });

    const validateAndSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        put(route('time-logs.update', task.id), {
            onSuccess: () => router.visit(route('time-logs.index')),
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>

                <form onSubmit={validateAndSubmit} className="space-y-3">
                    <div>
                        <label className="text-sm font-medium">Date</label>
                        <DatePicker
                            date={data.work_date}
                            onChange={(date) => setData('work_date', date as Date)}
                            disabled={(date: Date) => date > new Date()}
                        />
                        <InputError message={errors.work_date} />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea value={data.description} onChange={(e) => setData('description', e.target.value)} />
                        <InputError message={errors.description} />
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label>Hours</label>
                            <Input type="number" value={data.hours} onChange={(e) => setData('hours', Number(e.target.value))} />
                            <InputError message={errors.hours} />
                        </div>
                        <div className="flex-1">
                            <label>Minutes</label>
                            <Input type="number" value={data.minutes} onChange={(e) => setData('minutes', Number(e.target.value))} />
                            <InputError message={errors.minutes} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={processing}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
