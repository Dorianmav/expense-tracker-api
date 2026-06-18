import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OccurrenceStatus } from '../../models/occurrence-status.enum';
import { CalendarService } from './calendar.service';
import {
  CalendarProjectionItemDto,
  CalendarProjectionKind,
} from './dto/calendar-projection-item.dto';
import { CalendarProjectionQueryDto } from './dto/calendar-projection-query.dto';
import { UpdateOccurrenceStatusDto } from './dto/update-occurrence-status.dto';

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

  @Patch('occurrences/:kind/:id/status')
  @ApiOperation({ summary: 'Mettre a jour le statut d une occurrence calendrier' })
  @ApiResponse({
    status: 200,
    description: 'Statut mis a jour',
    schema: {
      type: 'object',
      properties: {
        status: { enum: Object.values(OccurrenceStatus) },
      },
    },
  })
  updateOccurrenceStatus(
    @Param('kind', new ParseEnumPipe(CalendarProjectionKind)) kind: CalendarProjectionKind,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateOccurrenceStatusDto,
  ): Promise<{ status: OccurrenceStatus }> {
    return this.calendarService.updateOccurrenceStatus(kind, id, body.status);
  }
}
