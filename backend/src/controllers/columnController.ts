import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Column from '../models/Column';
import { z } from 'zod';

const createColumnSchema = z.object({
  title: z.string().min(1),
  order: z.number().optional(),
});

const updateColumnSchema = z.object({
  title: z.string().min(1).optional(),
  order: z.number().optional(),
});

export const getColumns = async (req: AuthRequest, res: Response) => {
  try {
    const columns = await Column.find({ userId: req.user._id }).sort({ order: 1 });
    res.json({ success: true, columns });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createColumn = async (req: AuthRequest, res: Response) => {
  try {
    const data = createColumnSchema.parse(req.body);
    const maxOrder = await Column.findOne({ userId: req.user._id })
      .sort({ order: -1 })
      .select('order');

    const column = await Column.create({
      userId: req.user._id,
      title: data.title,
      order: data.order ?? (maxOrder?.order ?? -1) + 1,
    });

    res.status(201).json({ success: true, column });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateColumn = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateColumnSchema.parse(req.body);

    const column = await Column.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      data,
      { new: true }
    );

    if (!column) {
      return res.status(404).json({ success: false, error: 'Column not found' });
    }

    res.json({ success: true, column });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteColumn = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const column = await Column.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!column) {
      return res.status(404).json({ success: false, error: 'Column not found' });
    }

    res.json({ success: true, message: 'Column deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

