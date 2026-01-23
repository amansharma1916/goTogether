import '../../Styles/User/Assets/BookingLoader.css';

interface BookingLoaderProps {
  isVisible: boolean;
  message?: string;
}

const BookingLoader = ({ isVisible, message = 'Please wait...' }: BookingLoaderProps) => {
  if (!isVisible) return null;

  return (
    <div className="booking-loader-overlay">
      <div className="booking-loader-content">
        <div className="booking-loader-spinner">
          <div className="spinner-circle"></div>
        </div>
        <p className="booking-loader-text">{message}</p>
      </div>
    </div>
  );
};

export default BookingLoader;
