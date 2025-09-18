# Timetable Excel Import Guide

## Overview

The Timetable feature now supports importing data from multiple file formats:
- **CSV** (Comma Separated Values)
- **XLSX** (Excel 2007+ format)
- **XLS** (Legacy Excel format)

## Database Configuration

The timetable data is stored in a separate MongoDB database:
- **Database URL**: `mongodb://127.0.0.1:27017/timetable`
- **Collection**: `timetableentries`

This ensures complete separation from the todo list data which uses:
- **Database URL**: `mongodb://127.0.0.1:27017/todolist`

## File Format Requirements

Your file must have the following columns in this exact order:

| Column Name | Description | Valid Values |
|-------------|-------------|--------------|
| Subject Name | Name of the subject/course | Any text |
| Teacher Name | Name of the instructor | Any text |
| Class Number | Room or lab identifier | Any text |
| Class Type | Type of class | "Theory" or "Lab" |
| Timings | Class timing schedule | Any text (e.g., "08:00 - 09:30") |
| Day | Day of the week | Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday, or Sat/Sun |

## Example Data

```
Subject Name,Teacher Name,Class Number,Class Type,Timings,Day
HCI & Comp. Graphics Lab,Abdul Rehman,Lab 22 OB,Lab,08:00 - 09:30,Monday
Web Technologies,Abdul Rehman,Room 19 NB,Theory,12:00 - 14:00,Monday
Digital Image Processing,Aisha Riaz,Room 17 NB,Theory,14:00 - 16:00,Monday
Operating Systems Lab,Tania Saddique,Lab 22 OB,Lab,08:00 - 11:00,Tuesday
```

## Features

### Import Functionality
- Supports CSV, XLSX, and XLS file formats
- Automatic validation of file structure
- Error reporting for invalid data
- Bulk import with progress feedback

### Theme Consistency
- Uses the application's dark theme
- Consistent button styling with other components
- Proper color scheme using CSS custom properties

### Database Separation
- Dedicated database for timetable data
- Independent from todo list functionality
- Proper connection management for multiple databases

## Technical Implementation

### Frontend Changes
- Added XLSX library for Excel file parsing
- Enhanced file upload handler to support multiple formats
- Updated UI to reflect new capabilities

### Backend Changes
- Separate database connection configuration
- Updated models to use dedicated timetable connection
- Maintained existing API endpoints for compatibility

## Usage Instructions

1. **Navigate** to the Timetable section from the main menu
2. **Click** the "Import File" button
3. **Select** your CSV, XLSX, or XLS file
4. **Review** any validation errors if they occur
5. **Confirm** the import when successful

The system will automatically validate your data and provide feedback on any issues found.