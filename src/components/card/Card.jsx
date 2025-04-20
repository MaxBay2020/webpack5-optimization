import _ from "lodash";
import moment from "moment";

const Card = () => {
    return (
        <div>
            Card
            {_.difference([2, 1], [2, 3])}
            {moment().format()}
        </div>
    );
};

export default Card;
