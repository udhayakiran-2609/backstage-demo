import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
} from '@material-ui/core';

export const EntityCard = ({ entity }: any) => {
  return (
    <Card
      style={{
        borderRadius: 16,
        height: '100%',
      }}
    >
      <CardContent>
        <Typography variant="h6">
          {entity.metadata.name}
        </Typography>

        <br />

        <Chip
          size="small"
          color="primary"
          label={entity.spec?.type}
        />

        <br />
        <br />

        <Typography color="textSecondary">
          Owner : {entity.spec?.owner}
        </Typography>

        <Typography color="textSecondary">
          Lifecycle : {entity.spec?.lifecycle}
        </Typography>

        <br />

        <Button
          variant="contained"
          color="primary"
          href={`/catalog/default/component/${entity.metadata.name}`}
        >
          Open
        </Button>
      </CardContent>
    </Card>
  );
};