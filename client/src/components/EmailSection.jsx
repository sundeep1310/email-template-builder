import PropTypes from 'prop-types';

const EmailSection = ({ type, content, onChange }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
        {type}
      </label>
      <textarea
        className="w-full p-2 border rounded-md min-h-[100px]"
        value={content}
        onChange={(e) => onChange(type, e.target.value)}
        placeholder={`Enter ${type} content...`}
      />
    </div>
  );
};

EmailSection.propTypes = {
  type: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

EmailSection.defaultProps = {
  content: ''
};

export default EmailSection;