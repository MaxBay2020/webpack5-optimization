import _ from 'lodash'
import moment from 'moment'

const Alert = () => {

    console.log(process.env.API_URL)
    return (
        <div>
            alert!
            {_.difference([2, 1], [2, 3])}
            {moment().format()}
        </div>
    );
};

export default Alert;
