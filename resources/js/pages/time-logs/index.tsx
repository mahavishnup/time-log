import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { EditTaskModal } from './_components/edit-task-modal';

interface Log {
    id: number;
    work_date: string;
    description: string;
    hours: number;
    minutes: number;
}

interface IndexProps {
    logsByDate: {
        [date: string]: Log[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Time Logs', href: route('time-logs.index') }];

export default function Index({ logsByDate }: IndexProps) {
    const { data, setData, post, processing, errors } = useForm<{
        work_date: Date | undefined;
        description: string;
        hours: number;
        minutes: number;
    }>({
        work_date: undefined,
        description: '',
        hours: 0,
        minutes: 0,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(route('time-logs.store'), {
            onSuccess: () => router.visit(route('time-logs.index')),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Time Logs" />

            <div className="mx-auto w-full max-w-7xl space-y-6 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Log Your Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Date</label>
                                <DatePicker
                                    date={data.work_date}
                                    onChange={(date) => setData('work_date', date as Date)}
                                    disabled={(date: Date) => date > new Date()}
                                />
                                <InputError message={errors.work_date} />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Task Description</label>
                                <Textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    maxLength={255}
                                    placeholder="Describe your task..."
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="flex items-center gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Hours</label>
                                    <Input
                                        type="number"
                                        value={data.hours}
                                        onChange={(e) => setData('hours', Number(e.target.value))}
                                        min={0}
                                        max={10}
                                    />
                                    <InputError message={errors.hours} />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Minutes</label>
                                    <Input
                                        type="number"
                                        value={data.minutes}
                                        onChange={(e) => setData('minutes', Number(e.target.value))}
                                        min={0}
                                        max={59}
                                    />
                                    <InputError message={errors.minutes} />
                                </div>
                            </div>

                            <div>
                                <Separator className="my-4" />
                                <Button type="submit" disabled={processing}>
                                    Submit
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Separator />

                <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Logged Tasks (Grouped by Date)</h3>
                    {Object.keys(logsByDate).map((date) => (
                        <Card key={date}>
                            <CardHeader>
                                <CardTitle>{format(new Date(date), 'dd MMM yyyy')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="ml-5 list-disc space-y-1">
                                    {logsByDate[date].map((log) => (
                                        <li key={log.id} className="flex items-center justify-between">
                                            <span>
                                                {log.description} — {log.hours}h {log.minutes}m
                                            </span>
                                            <div className="flex gap-2">
                                                <EditTaskModal task={log} />
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this task?')) {
                                                            router.delete(route('time-logs.destroy', log.id), {
                                                                preserveScroll: true,
                                                            });
                                                        }
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
