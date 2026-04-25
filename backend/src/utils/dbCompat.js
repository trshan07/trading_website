const MISSING_RELATION = '42P01';
const MISSING_COLUMN = '42703';

const isMissingRelationError = (error) => error?.code === MISSING_RELATION;

const isMissingColumnError = (error) => error?.code === MISSING_COLUMN;

const isSchemaMismatchError = (error) =>
    isMissingRelationError(error) || isMissingColumnError(error);

module.exports = {
    isMissingRelationError,
    isMissingColumnError,
    isSchemaMismatchError,
};
