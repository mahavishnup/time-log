<?php

use App\Models\User;
use App\Models\TimeLog;
use function Pest\Laravel\{actingAs, post, put, delete};
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    actingAs($this->user);
});

it('allows creating a time log entry', function () {
    $response = post(route('time-logs.store'), [
        'work_date' => now()->toDateString(),
        'description' => 'Worked on API integration',
        'hours' => 3,
        'minutes' => 30,
    ]);

    $response->assertRedirect(route('time-logs.index'));
    expect(TimeLog::count())->toBe(1);
});

it('rejects time log that exceeds 10 hours per day', function () {
    // Existing 8-hour task
    TimeLog::create([
        'work_date' => now()->toDateString(),
        'description' => 'Morning work',
        'hours' => 8,
        'minutes' => 0,
    ]);

    // Try adding 3 more hours
    $response = post(route('time-logs.store'), [
        'work_date' => now()->toDateString(),
        'description' => 'Evening work',
        'hours' => 3,
        'minutes' => 0,
    ]);

    $response->assertSessionHasErrors('total');
    expect(TimeLog::count())->toBe(1); // Should not add second task
});

it('allows updating a time log within 10 hour limit', function () {
    $log = TimeLog::create([
        'work_date' => now()->toDateString(),
        'description' => 'Initial',
        'hours' => 2,
        'minutes' => 0,
    ]);

    $response = put(route('time-logs.update', $log), [
        'work_date' => now()->toDateString(),
        'description' => 'Updated Task',
        'hours' => 4,
        'minutes' => 30,
    ]);

    $response->assertRedirect(route('time-logs.index'));
    $log->refresh();

    expect($log->description)->toBe('Updated Task');
    expect($log->hours)->toBe(4);
    expect($log->minutes)->toBe(30);
});

it('prevents updating a task if it causes daily total > 10 hours', function () {
    // 8h existing other task
    TimeLog::create([
        'work_date' => now()->toDateString(),
        'description' => 'Morning task',
        'hours' => 8,
        'minutes' => 0,
    ]);

    $log = TimeLog::create([
        'work_date' => now()->toDateString(),
        'description' => 'Update target',
        'hours' => 2,
        'minutes' => 0,
    ]);

    $response = put(route('time-logs.update', $log), [
        'work_date' => now()->toDateString(),
        'description' => 'Try update',
        'hours' => 3,
        'minutes' => 0,
    ]);

    $response->assertSessionHasErrors('total');
    $log->refresh();
    expect($log->hours)->toBe(2); // Still old value
});

it('deletes a task', function () {
    $log = TimeLog::create([
        'work_date' => now()->toDateString(),
        'description' => 'Temp task',
        'hours' => 1,
        'minutes' => 30,
    ]);

    delete(route('time-logs.destroy', $log))->assertRedirect(route('time-logs.index'));

    expect(TimeLog::find($log->id))->toBeNull();
});
