<?php

namespace App\Http\Controllers;

use App\Models\TimeLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TimeLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $logs = TimeLog::orderBy('work_date', 'desc')->get()
        ->groupBy('work_date');

        return Inertia::render('time-logs/index', [
            'logsByDate' => $logs,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'work_date' => 'required|date|before_or_equal:today',
            'description' => 'required|string|max:255',
            'hours' => 'required|integer|min:0|max:10',
            'minutes' => 'required|integer|min:0|max:59',
        ]);

        $totalMinutes = TimeLog::where('work_date', $validated['work_date'])->get()
            ->sum(fn($log) => $log->hours * 60 + $log->minutes);

        $newMinutes = $validated['hours'] * 60 + $validated['minutes'];

        if (($totalMinutes + $newMinutes) > 600) {
            return back()->withErrors(['work_date' => 'Cannot log more than 10 hours per day']);
        }

        TimeLog::create($validated);

        return redirect()->route('time-logs.index')->with('success', 'Task logged.');
    }

    /**
     * Display the specified resource.
     */
    public function show(TimeLog $timeLog)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TimeLog $timeLog)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TimeLog $timeLog)
    {
        $validated = $request->validate([
            'work_date' => 'required|date|before_or_equal:today',
            'description' => 'required|string|max:255',
            'hours' => 'required|integer|min:0|max:10',
            'minutes' => 'required|integer|min:0|max:59',
        ]);

        $totalMinutes = TimeLog::where('work_date', $validated['work_date'])
            ->where('id', '!=', $timeLog->id)
            ->get()
            ->sum(fn($log) => $log->hours * 60 + $log->minutes);

        $newMinutes = $validated['hours'] * 60 + $validated['minutes'];

        if (($totalMinutes + $newMinutes) > 600) {
            return back()->withErrors(['work_date' => 'Cannot log more than 10 hours for this day.']);
        }

        $timeLog->update($validated);

        return redirect()->route('time-logs.index')->with('success', 'Task updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TimeLog $timeLog)
    {
        $timeLog->delete();

        return redirect()->route('time-logs.index')->with('success', 'Task deleted successfully.');
    }
}
