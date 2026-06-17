import { logActivity } from "../utils/activity.js";

export const listItems = (Model) => async (req, res, next) => {
  try {
    const items = await Model.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

export const createItem = (Model, transform = (data) => data, resourceName = "item") => async (req, res, next) => {
  try {
    const item = await Model.create({
      ...transform(req.body),
      user: req.user._id
    });

    await logActivity({
      user: req.user._id,
      type: `${resourceName}.create`,
      message: `${resourceName} created`,
      metadata: { id: item._id, title: item.title || item.name },
      ip: req.ip
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

export const updateItem = (Model, transform = (data) => data, resourceName = "item") => async (req, res, next) => {
  try {
    const item = await Model.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      transform(req.body),
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    await logActivity({
      user: req.user._id,
      type: `${resourceName}.update`,
      message: `${resourceName} updated`,
      metadata: { id: item._id, title: item.title || item.name },
      ip: req.ip
    });

    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const deleteItem = (Model, resourceName = "item") => async (req, res, next) => {
  try {
    const item = await Model.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    await logActivity({
      user: req.user._id,
      type: `${resourceName}.delete`,
      message: `${resourceName} deleted`,
      metadata: { id: req.params.id, title: item.title || item.name },
      ip: req.ip
    });

    res.json({ message: "Item deleted", id: req.params.id });
  } catch (error) {
    next(error);
  }
};
