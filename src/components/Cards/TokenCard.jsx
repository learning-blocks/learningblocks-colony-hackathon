import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Typography,
  Button,
  withStyles

} from "material-ui";
import moment from "moment";
import PropTypes from "prop-types";
import React from "react";
import cardStyle from "../../assets/jss/tokenCardStyle";


function TokenCard({ ...props }) {
  const { classes, token, onTask } = props;
  return (
    <Card className={classes.card}>
      <CardHeader
        classes={{
          root: classes.cardHeader,
          avatar: classes.cardAvatar
        }}
        avatar={
          <img
            src={"https://ipfs.infura.io/ipfs/"+token.image}
            alt="..."
            className={classes.img}
          />
        }
      />
      <CardContent className={classes.textAlign}>
        <Typography component="h6" className={classes.cardSubtitle}>
          {token.provider}
        </Typography>

        <Typography component="h4" className={classes.cardTitle}>
          {token.name}
        </Typography>

        <Typography component="p" className={classes.cardDescription}>
          {token.description}
        </Typography>

        <Typography component="p" className={classes.cardDescription}>
          {moment(token.dateOfIssuance).format("MMMM Do YYYY")}
        </Typography>

        {token.score !== undefined ? (
          <Typography component="p" className={classes.cardSubtitle}>
            Score: {token.score}
          </Typography>
        ) : null}
      </CardContent>
      <CardActions className={classes.textAlign + " " + classes.cardActions}>
        { <Button color="secondary" variant="raised" onClick={() => onTask(token.task)} disabled={!token.task}>Start Review</Button>}
      </CardActions>
    </Card>
  );
}

TokenCard.propTypes = {
  token: PropTypes.object.isRequired
};

export default withStyles(cardStyle)(TokenCard);
