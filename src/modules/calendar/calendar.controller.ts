import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { CalendarProjectionItemDto } from './dto/calendar-projection-item.dto';
import { CalendarProjectionQueryDto } from './dto/calendar-projection-query.dto';

@ApiTags('calendar')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('projection')
  @ApiOperation({ summary: 'Projeter les occurrences calendrier' })
  @ApiQuery({ name: 'startDate', required: false, example: '01/01/2026' })
  @ApiQuery({ name: 'endDate', required: false, example: '30/06/2026' })
  @ApiResponse({
    status: 200,
    description: 'Occurrences calendrier projetees',
    type: [CalendarProjectionItemDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Plage de dates invalide ou superieure a 24 mois',
  })
  getProjection(@Query() query: CalendarProjectionQueryDto): Promise<CalendarProjectionItemDto[]> {
    return this.calendarService.getProjection(query);
  }
}
