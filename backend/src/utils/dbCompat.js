const MISSING_RELATION = '42P01';
const MISSING_COLUMN = '42703';

const isMissingRelationError = (error) => error?.code === MISSING_RELATION;

const isMissingColumnError = (error) => error?.code === MISSING_COLUMN;

const isSchemaMismatchError = (error) =>
    isMissingRelationError(error) || isMissingColumnError(error);

const getMissingColumnName = (error) => {
    const match = error?.message?.match(/column\s+"([^"]+)"/i);
    return match ? match[1] : null;
};

module.exports = {
    isMissingRelationError,
    isMissingColumnError,
    isSchemaMismatchError,
    getMissingColumnName,
};
